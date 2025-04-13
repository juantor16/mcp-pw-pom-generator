import { Page, Locator } from '@playwright/test';

export class Https://qa.biosafeapp.com/contactPage {
  constructor(private readonly page: Page) {
  readonly biosafeappLink: Locator;
  readonly registrarseLink: Locator;
  readonly enviarButton: Locator;
    this.biosafeappLink = page.locator('a');
    this.registrarseLink = page.locator('.register-button');
    this.enviarButton = page.locator('.contact-button');
  }

}