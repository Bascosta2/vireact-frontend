import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import UserPage from '@/components/Layout/UserPage';
import { PageHeader } from '@/components/app/PageHeader';
import { Button } from '@/components/app/Button';
import { Dropzone, type DropzoneHandle } from '@/components/app/Dropzone';
import { PresetPicker } from '@/components/app/PresetPicker';
import { FeatureChecklist } from '@/components/app/FeatureChecklist';
import { ProgressPanel } from '@/components/app/ProgressPanel';
import { useQuota } from '@/hooks/useQuota';
import { presetFeatureIds, type PresetId } from '@/lib/analysis-presets';
import { usePendingUpload, type PendingUploadState } from '@/contexts/PendingUploadContext';
import { useActiveAnalyses } from '@/contexts/ActiveAnalysesContext';
import { useSubscription } from '@/redux/hooks/use-subscription';
import { findFeature } from '@/data/analysis-features';
import { inspectVideoFile } from '@/lib/video-metadata';
import { cleanVideoTitle, fileExtension, formatDuration, formatFileSize, VIDEO_ERRORS } from '@/lib/video-file';
import { FileRow } from './FileRow';

const STORAGE_SELECTED = 'vireact-selected-feature-ids';
const STORAGE_PRESET = 'vireact-analysis-preset';

const loadStoredFeatures = (): string[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_SELECTED) ?? '[]') as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
};

const loadStoredPreset = (): PresetId => {
  const v = localStorage.getItem(STORAGE_PRESET);
  if (v === 'custom') return loadStoredFeatures().length > 0 ? 'custom' : 'full';
  return v === 'hook' ? 'hook' : 'full';
};

/** Rename by wrapping the same bytes in a new File; the server stores the uploaded file name. */
const withName = (file: File, title: string): File => {
  const ext = fileExtension(file.name);
  const safe = title.trim().replace(/[\\/:*?"<>|]+/g, ' ').trim();
  if (!safe || safe === cleanVideoTitle(file.name)) return file;
  return new File([file], `${safe}.${ext}`, { type: file.type, lastModified: file.lastModified });
};

function NewAnalysis() {
  const { pending, setPending, clearPending } = usePendingUpload();
  const { job, notifyState, start, retry, reset, enableNotifications } = useActiveAnalyses();
  const { plan } = useSubscription();
  const quota = useQuota();
  const canUsePro = plan === 'pro' || plan === 'enterprise';

  const [fileError, setFileError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [title, setTitle] = useState(() => (pending?.file ? cleanVideoTitle(pending.file.name) : ''));
  const [preset, setPreset] = useState<PresetId>(loadStoredPreset);
  const [customIds, setCustomIds] = useState<string[]>(loadStoredFeatures);
  const [featureError, setFeatureError] = useState<string | null>(null);
  const [quotaError, setQuotaError] = useState(false);
  const dropzoneRef = useRef<DropzoneHandle>(null);
  const checksHeadingId = useId();

  const allowedCustom = customIds.filter((id) => findFeature(id) && (canUsePro || findFeature(id)?.tier !== 'pro'));
  const selectedIds = preset === 'custom' ? allowedCustom : presetFeatureIds(preset, canUsePro);

  useEffect(() => {
    localStorage.setItem(STORAGE_PRESET, preset);
  }, [preset]);

  useEffect(() => {
    localStorage.setItem(STORAGE_SELECTED, JSON.stringify(selectedIds));
  }, [selectedIds.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  const acceptFile = useCallback(
    async (file: File) => {
      setChecking(true);
      setFileError(null);
      const result = await inspectVideoFile(file);
      setChecking(false);
      if (result.error) {
        setFileError(result.error);
        return;
      }
      if (pending?.videoMetadata?.previewUrl) URL.revokeObjectURL(pending.videoMetadata.previewUrl);
      const next: PendingUploadState = { file, displayName: file.name, videoMetadata: result.metadata };
      setPending(next);
      setTitle(cleanVideoTitle(file.name));
    },
    [pending, setPending]
  );

  const removeFile = () => {
    if (pending?.videoMetadata?.previewUrl) URL.revokeObjectURL(pending.videoMetadata.previewUrl);
    clearPending();
    setTitle('');
    setFileError(null);
    requestAnimationFrame(() => dropzoneRef.current?.focus());
  };

  const outOfQuota = quota.remaining === 0;

  const analyze = () => {
    if (!pending?.file) {
      setFileError(VIDEO_ERRORS.missing);
      dropzoneRef.current?.focus();
      return;
    }
    if (selectedIds.length === 0) {
      setFeatureError('Select at least one check');
      return;
    }
    if (outOfQuota) {
      setQuotaError(true);
      return;
    }
    setFeatureError(null);
    void start(withName(pending.file, title), selectedIds);
  };

  const startOver = () => {
    if (pending?.videoMetadata?.previewUrl) URL.revokeObjectURL(pending.videoMetadata.previewUrl);
    clearPending();
    setTitle('');
    reset();
  };

  if (job) {
    return (
      <UserPage>
        <div className="mx-auto w-full max-w-[720px] px-4 py-8 md:px-8 md:py-10">
          <PageHeader title="New analysis" />
          <ProgressPanel
            stage={job.stage}
            uploadPercent={job.uploadPercent}
            startedAt={job.startedAt}
            fileName={cleanVideoTitle(job.fileName)}
            videoId={job.videoId}
            errorMessage={job.errorMessage}
            notifyState={notifyState}
            onNotify={enableNotifications}
            onRetry={job.stage === 'failed' && !job.videoId ? retry : undefined}
            onStartOver={startOver}
          />
        </div>
      </UserPage>
    );
  }

  const meta = pending?.videoMetadata ?? null;

  return (
    <UserPage>
      <div className="mx-auto w-full max-w-[720px] px-4 pt-8 md:px-8 md:pt-10">
        <PageHeader title="New analysis" subtitle="Add a short video. We'll score it and tell you what to fix." />

        <section aria-label="Video">
          {pending?.file && meta ? (
            <FileRow
              previewUrl={meta.previewUrl}
              title={title}
              onTitleChange={setTitle}
              details={[formatDuration(meta.duration), formatFileSize(meta.size)].filter(Boolean).join(' · ')}
              onReplace={() => dropzoneRef.current?.open()}
              onRemove={removeFile}
            />
          ) : null}
          <Dropzone
            ref={dropzoneRef}
            onFile={(f) => void acceptFile(f)}
            error={fileError}
            disabled={checking}
            label={checking ? 'Checking your video' : 'Drop a video here or choose a file'}
            className={pending?.file && meta ? 'hidden' : undefined}
          />
          {pending?.file && meta && fileError && (
            <p role="alert" className="mt-2 text-sm font-medium text-danger">
              {fileError}
            </p>
          )}
        </section>

        <section className="mt-10" aria-labelledby={checksHeadingId}>
          <h2 id={checksHeadingId} className="mb-3 text-lg font-semibold text-fg">
            What should we analyze?
          </h2>
          <PresetPicker
            value={preset}
            onChange={(p) => {
              if (p === 'custom' && allowedCustom.length === 0) setCustomIds(selectedIds);
              setPreset(p);
              setFeatureError(null);
            }}
            canUsePro={canUsePro}
            labelledBy={checksHeadingId}
          />
          {preset === 'custom' && (
            <div className="mt-4">
              <FeatureChecklist
                selected={allowedCustom}
                onChange={(ids) => {
                  setCustomIds(ids);
                  setFeatureError(null);
                }}
                canUsePro={canUsePro}
                error={featureError}
              />
            </div>
          )}
          {preset !== 'custom' && featureError && (
            <p role="alert" className="mt-2 text-sm font-medium text-danger">{featureError}</p>
          )}
        </section>

        <div className="sticky bottom-[calc(56px+env(safe-area-inset-bottom))] z-10 -mx-4 mt-10 border-t border-line bg-canvas/95 px-4 py-4 backdrop-blur-md md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:pb-12 md:backdrop-blur-none">
          <Button fullWidth onClick={analyze} className="md:w-auto md:min-w-[200px]">
            Analyze video
          </Button>
          <QuotaLine remaining={quota.remaining} total={quota.limit} showError={quotaError} />
        </div>
      </div>
    </UserPage>
  );
}

function QuotaLine({ remaining, total, showError }: { remaining: number | null; total: number | null; showError: boolean }) {
  if (remaining == null || total == null) return null;
  if (remaining === 0) {
    return (
      <p role={showError ? 'alert' : undefined} className="mt-2 text-sm text-fg-muted">
        <span className={showError ? 'font-medium text-danger' : undefined}>You've used all {total} analyses this month.</span>{' '}
        <Link to="/subscription-plans" className="app-focus rounded font-medium text-accent hover:underline">
          Upgrade
        </Link>
      </p>
    );
  }
  return <p className="tabular mt-2 text-sm text-fg-muted">Uses 1 of your {remaining} analyses this month.</p>;
}

export default NewAnalysis;
