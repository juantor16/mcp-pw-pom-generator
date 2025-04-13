import { Page, Locator } from '@playwright/test';

export class Https://qa.biosafeapp.com/#pricingPage {
  constructor(private readonly page: Page) {
  readonly biosafeappLink: Locator;
  readonly registrarseLink: Locator;
  readonly prubaloGratisLink: Locator;
  readonly suscribirmeButton: Locator;
    this.biosafeappLink = page.locator('a');
    this.registrarseLink = page.locator('.register-button');
    this.prubaloGratisLink = page.locator('.cta-button');
    this.suscribirmeButton = page.locator('.subscribe-button');
  }

}