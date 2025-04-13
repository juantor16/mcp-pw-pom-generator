import { Page, Locator } from '@playwright/test';

export class Https://qa.biosafeapp.com/loginPage {
  constructor(private readonly page: Page) {
  readonly biosafeappLink: Locator;
  readonly registrarseLink: Locator;
  readonly iniciarSesinButton: Locator;
  readonly recupralaAquLink: Locator;
  readonly regstrateAquLink: Locator;
    this.biosafeappLink = page.locator('a');
    this.registrarseLink = page.locator('.register-button');
    this.iniciarSesinButton = page.getByTestId('login-button');
    this.recupralaAquLink = page.getByTestId('forgot-password-link');
    this.regstrateAquLink = page.getByTestId('signup-link');
  }

}