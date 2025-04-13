import { Page, Locator } from '@playwright/test';

export class Https://www.linkedin.com/company/69496944/Page {
  constructor(private readonly page: Page) {
  readonly userAgreementLink: Locator;
  readonly aLink: Locator;
  readonly aLink1: Locator;
  readonly editProfilePhotoButton: Locator;
  readonly buttonButton: Locator;
  readonly buttonButton1: Locator;
  readonly cancelButton: Locator;
  readonly userAgreementLink1: Locator;
  readonly joinformsubmitButton: Locator;
  readonly signInButton: Locator;
  readonly elementButton: Locator;
  readonly dismissButton: Locator;
  readonly showButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly signInButton1: Locator;
  readonly roledivButton: Locator;
  readonly joinNowButton: Locator;
  readonly aLink2: Locator;
  readonly rolebuttonButton: Locator;
  readonly buttonButton2: Locator;
    this.userAgreementLink = page.locator('a');
    this.aLink = page.locator('.skip-link');
    this.aLink1 = page.locator('.nav__logo-link');
    this.editProfilePhotoButton = page.getByLabel('Edit profile photo');
    this.buttonButton = page.locator('.profile-card__not-you');
    this.buttonButton1 = page.locator('.profile-card__edit-photo-text');
    this.cancelButton = page.getByLabel('Cancel');
    this.userAgreementLink1 = page.locator('.join-form__form-body-agreement-item-link');
    this.joinformsubmitButton = page.locator('#join-form-submit');
    this.signInButton = page.locator('.authwall-join-form__form-toggle--bottom');
    this.elementButton = page.locator('.modal__outlet');
    this.dismissButton = page.getByLabel('Dismiss');
    this.showButton = page.getByLabel('Show your LinkedIn password');
    this.forgotPasswordLink = page.locator('.font-sans');
    this.signInButton1 = page.locator('.btn-md');
    this.roledivButton = page.getByRole('button');
    this.joinNowButton = page.locator('.authwall-sign-in-form__form-toggle--bottom');
    this.aLink2 = page.locator('.li-footer__item-link');
    this.rolebuttonButton = page.getByRole('menuitem');
    this.buttonButton2 = page.locator('.language-selector__button');
  }

}