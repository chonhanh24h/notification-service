# Implement AWS SES to Send Email OTP in notification-service

This plan outlines the integration of AWS Simple Email Service (SES) in the `notification-service` to send registration OTP emails.

## User Review Required

> [!IMPORTANT]
> The implementation relies on the following new environment variables in the `.env` file of `notification-service`:
> - `AWS_REGION` (default: `ap-southeast-2`)
> - `AWS_PROFILE` (default: `cn24h-dev`, for local authentication)
> - `SES_SENDER_EMAIL` (the verified email address on AWS SES to send emails from)
>
> Please ensure that `SES_SENDER_EMAIL` is verified in your AWS account (sandbox or production) and that local credentials or IAM role are configured properly.

## Proposed Changes

### Notification Service Component

To integrate AWS SES, we will install the AWS SES client library and create/update files in the notification service:

---

### [package.json](file:///wsl.localhost/Ubuntu/home/pc-ubuntu/projects/notification-service/package.json)
- Add `@aws-sdk/client-ses` and `@aws-sdk/credential-providers` to dependencies.

### [notification.service.ts](file:///wsl.localhost/Ubuntu/home/pc-ubuntu/projects/notification-service/src/notification/notification.service.ts)
- Import `SESClient` and `SendEmailCommand` from `@aws-sdk/client-ses`.
- Initialize `SESClient` using the configured `AWS_REGION` and `AWS_PROFILE` (using `fromIni`).
- Update `handleRegisterOtp` to format an HTML/text template with the OTP and send the email via AWS SES.

### [.env](file:///wsl.localhost/Ubuntu/home/pc-ubuntu/projects/notification-service/.env)
- Add SES and AWS environment variables:
  ```env
  AWS_REGION=ap-southeast-2
  AWS_PROFILE=cn24h-dev
  SES_SENDER_EMAIL=noreply.chonhanh24h@gmail.com  # Needs to be replaced with the user's verified sender email
  ```

### [docker-compose.yml](file:///wsl.localhost/Ubuntu/home/pc-ubuntu/projects/docker-compose/docker-compose.yml)
- Mount `~/.aws` to `/root/.aws` in `notification-service` service.
- Forward AWS environment variables (`AWS_REGION`, `AWS_PROFILE`, `SES_SENDER_EMAIL`) into the container.

## Verification Plan

### Automated Tests
- Run `npm run build` inside `notification-service` to ensure clean compilation.

### Manual Verification
- Start `notification-service` with `npm run start:dev`.
- Send an event or trigger the registration flow to verify that an email is successfully sent using SES.
