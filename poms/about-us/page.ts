import { Page, Locator } from '@playwright/test';

export class Https://qa.biosafeapp.com/aboutUsPage {
  constructor(private readonly page: Page) {
  readonly biosafeappLink: Locator;
  readonly registrarseLink: Locator;
  readonly contctanosLink: Locator;
    this.biosafeappLink = page.locator('a');
    this.registrarseLink = page.locator('.register-button');
    this.contctanosLink = page.locator('.about-us-a');
  }

}