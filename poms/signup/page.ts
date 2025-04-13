import { Page, Locator } from '@playwright/test';

export class Https://qa.biosafeapp.com/signupPage {
  constructor(private readonly page: Page) {
  readonly biosafeappLink: Locator;
  readonly registrarseLink: Locator;
  readonly registrarseButton: Locator;
    this.biosafeappLink = page.locator('a');
    this.registrarseLink = page.locator('.register-button');
    this.registrarseButton = page.getByTestId('botonRegistro');
  }

}