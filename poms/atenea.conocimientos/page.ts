import { Page, Locator } from '@playwright/test';

export class Https://instagram.com/atenea.conocimientos/Page {
  constructor(private readonly page: Page) {
  readonly instagramLink: Locator;
  readonly followButton: Locator;
  readonly messageButton: Locator;
  readonly postsLink: Locator;
  readonly buttonButton: Locator;
  readonly metaLink: Locator;
  readonly switchDisplayLanguageSelect: Locator;
  readonly termsOfUseLink: Locator;
    this.instagramLink = page.getByRole('link');
    this.followButton = page.locator('.');
    this.messageButton = page.getByRole('button');
    this.postsLink = page.getByRole('tab');
    this.buttonButton = page.locator('.x1lugfcp');
    this.metaLink = page.locator('.x1fhwpqd');
    this.switchDisplayLanguageSelect = page.getByLabel('Switch Display Language');
    this.termsOfUseLink = page.locator('a');
  }

}