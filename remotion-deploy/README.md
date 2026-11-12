# Editor export: Remotion Lambda setup

The Editor tab previews edits in the browser with `@remotion/player`. Exports render the same
composition (`src/remotion/`) on AWS Lambda. This folder holds the deploy tooling only; it is not
part of the web app build.

Versions: every `remotion` / `@remotion/*` package is pinned to **4.0.539** here, in the web app and
in the backend (`@remotion/lambda-client`). Upgrade them together.

## One-time setup

1. **AWS user and role.** Follow https://www.remotion.dev/docs/lambda/setup. Get the policies with
   `npm run policies:role` (Lambda role `remotion-lambda-role`) and `npm run policies:user` (the IAM
   user whose keys the backend uses).
2. **Let renders write to the app bucket.** Exports are saved to `AWS_S3_BUCKET_NAME` under
   `editor/renders/`. Add to `remotion-lambda-role`:
   `s3:PutObject`, `s3:PutObjectAcl`, `s3:GetObject` on `arn:aws:s3:::<bucket>/editor/renders/*`.
3. Install and deploy (use the same region as the bucket):
   ```bash
   cd remotion-deploy
   npm install
   export AWS_ACCESS_KEY_ID=... AWS_SECRET_ACCESS_KEY=... REMOTION_AWS_REGION=us-east-1
   npm run functions   # prints the function name
   npm run site        # prints the serve URL
   ```
4. Set on Railway (backend):
   - `REMOTION_FUNCTION_NAME`: from step 3
   - `REMOTION_SERVE_URL`: from step 3
   - `REMOTION_REGION`: the region
   - `REMOTION_LICENSE_KEY`: only if you have a Remotion company license

New AWS accounts cap Lambda memory below 3008 MB, so the function uses 3000 MB (2048 MB crashed on
1080p footage). Raising it further is optional; redeploy and update `REMOTION_FUNCTION_NAME` if you do.

## Every time `src/remotion/` changes

Run `npm run site` again (same site name, so the serve URL stays the same).

## License

Remotion is free for individuals and companies of up to 3 people. Larger companies need a company
license: https://www.remotion.dev/license
