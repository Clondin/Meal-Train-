import { test } from '@playwright/test';

test.describe.skip('critical app flows', () => {
  test('registration to login flow', async () => {});
  test('create a meal train via wizard', async () => {});
  test('view public train and sign up as contributor', async () => {});
  test('guest sign up without account', async () => {});
  test('donation flow in Stripe test mode', async () => {});
  test('dashboard stats load correctly', async () => {});
  test('contributor updates delivery status', async () => {});
  test('organizer views participants and donations', async () => {});
});
