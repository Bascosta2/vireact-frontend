import { describe, expect, it } from 'vitest';
import {
  cleanVideoTitle,
  formatDuration,
  scoreTone,
  validateVideoDuration,
  validateVideoFile,
  VIDEO_ERRORS,
  VIDEO_MAX_BYTES,
} from './video-file';

describe('validateVideoFile', () => {
  it('accepts the five supported containers', () => {
    for (const ext of ['mp4', 'MOV', 'avi', 'mkv', 'webm']) {
      expect(validateVideoFile({ name: `clip.${ext}`, size: 1000 })).toBeNull();
    }
  });

  it('rejects other types, empty files and files over 200 MB with the exact copy', () => {
    expect(validateVideoFile({ name: 'clip.gif', size: 1000 })).toBe('The selected file must be an MP4, MOV, AVI, MKV or WEBM');
    expect(validateVideoFile({ name: 'clip.mp4', size: 0 })).toBe('The selected file is empty');
    expect(validateVideoFile({ name: 'clip.mp4', size: VIDEO_MAX_BYTES + 1 })).toBe('The selected file must be smaller than 200 MB');
  });
});

describe('validateVideoDuration', () => {
  it('allows 5 to 60 seconds', () => {
    expect(validateVideoDuration(5)).toBeNull();
    expect(validateVideoDuration(60)).toBeNull();
  });

  it('names the actual length when out of range', () => {
    expect(validateVideoDuration(73.4)).toBe('The selected video must be 5 to 60 seconds long. This one is 73 seconds.');
    expect(validateVideoDuration(2)).toBe(VIDEO_ERRORS.duration(2));
  });

  it('skips the check when duration is unknown', () => {
    expect(validateVideoDuration(Number.NaN)).toBeNull();
  });
});

describe('cleanVideoTitle', () => {
  it('strips downloader prefixes and the extension', () => {
    expect(cleanVideoTitle('SnapInsta.to_my_morning_routine.mp4')).toBe('My morning routine');
    expect(cleanVideoTitle('ssstik.io_@creator_1775618743301.mp4')).toBe('@creator 1775618743301');
    expect(cleanVideoTitle('YTDown.com_Shorts_hook_test.webm')).toBe('Shorts hook test');
    expect(cleanVideoTitle('copy_copy_final cut.mov')).toBe('Final cut');
  });

  it('falls back when nothing is left', () => {
    expect(cleanVideoTitle('copy_.mp4')).toBe('Untitled video');
  });
});

describe('helpers', () => {
  it('formats durations as m:ss', () => {
    expect(formatDuration(42.6)).toBe('0:43');
    expect(formatDuration(undefined)).toBe('');
  });

  it('uses the 70 / 40 score thresholds', () => {
    expect(scoreTone(70)).toBe('success');
    expect(scoreTone(69)).toBe('warning');
    expect(scoreTone(40)).toBe('warning');
    expect(scoreTone(39)).toBe('danger');
  });
});
