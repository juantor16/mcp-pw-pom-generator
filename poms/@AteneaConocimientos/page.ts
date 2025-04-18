import { Page, Locator } from '@playwright/test';

export class Https://www.youtube.com/@AteneaConocimientosPage {
  constructor(private readonly page: Page) {
  readonly elementButton: Locator;
  readonly elementButton1: Locator;
  readonly elementButton2: Locator;
  readonly elementButton3: Locator;
  readonly logoLink: Locator;
  readonly omitirNavegacinButton: Locator;
  readonly buscarButton: Locator;
  readonly accederLink: Locator;
  readonly endpointLink: Locator;
  readonly msButton: Locator;
  readonly msButton1: Locator;
  readonly suscribirseButton: Locator;
  readonly roletpytpapericonbuttonButton: Locator;
  readonly aLink: Locator;
  readonly thumbnailLink: Locator;
  readonly playwrightLeerEmailsParte2CmoGenerarElTokenDeGmailApiLink: Locator;
  readonly playwrightLeerEmailsParte1SetupGoogleCloudYGmailApiLink: Locator;
  readonly nosTomamosUnRespiroYSeguimosAprendiendoLink: Locator;
  readonly mcpPomGeneratorAhoraEntraATodoLoginConPlaywrightGlobalSetupLink: Locator;
  readonly adisHardcodingOptimizaTusTestsDePlaywrightConJsonYDatosDinmicosLink: Locator;
  readonly playwrightDeTestsLargosACdigoEleganteLink: Locator;
  readonly aLink1: Locator;
  readonly informacinshoppingButton: Locator;
  readonly activarSonidoButton: Locator;
  readonly cancelarButton: Locator;
  readonly verMsTardeButton: Locator;
  readonly compartirButton: Locator;
  readonly copiarVnculoButton: Locator;
  readonly enVivoButton: Locator;
  readonly buttonButton: Locator;
  readonly buttonButton1: Locator;
  readonly mediacontainerlinkLink: Locator;
    this.elementButton = page.locator('#button');
    this.elementButton1 = page.getByLabel('Expandir');
    this.elementButton2 = page.getByLabel('Atrás');
    this.elementButton3 = page.getByLabel('Guía');
    this.logoLink = page.locator('#logo');
    this.omitirNavegacinButton = page.getByLabel('Omitir navegación');
    this.buscarButton = page.getByLabel('Buscar');
    this.accederLink = page.getByLabel('Acceder');
    this.endpointLink = page.locator('#endpoint');
    this.msButton = page.locator('.truncated-text-wiz__inline-button');
    this.msButton1 = page.getByLabel('Descripción. ¡Bienvenidos al canal de Atenea Conocimientos!… Presiona para ver más.');
    this.suscribirseButton = page.getByLabel('Suscribirse');
    this.roletpytpapericonbuttonButton = page.getByRole('button');
    this.aLink = page.locator('.yt-simple-endpoint');
    this.thumbnailLink = page.locator('#thumbnail');
    this.playwrightLeerEmailsParte2CmoGenerarElTokenDeGmailApiLink = page.getByLabel('Playwright: Leer Emails (Parte 2: Cómo Generar el Token de Gmail API)');
    this.playwrightLeerEmailsParte1SetupGoogleCloudYGmailApiLink = page.getByLabel('Playwright: Leer Emails (Parte 1: Setup Google Cloud y Gmail API)');
    this.nosTomamosUnRespiroYSeguimosAprendiendoLink = page.getByLabel('Nos tomamos un respiro y seguimos aprendiendo');
    this.mcpPomGeneratorAhoraEntraATodoLoginConPlaywrightGlobalSetupLink = page.getByLabel('¡MCP POM Generator Ahora Entra a TODO! 🚀 (Login con Playwright Global Setup)');
    this.adisHardcodingOptimizaTusTestsDePlaywrightConJsonYDatosDinmicosLink = page.getByLabel('¡Adiós Hardcoding! Optimiza tus Tests de Playwright con JSON y Datos Dinámicos');
    this.playwrightDeTestsLargosACdigoEleganteLink = page.getByLabel('Playwright: De Tests Largos a Código Elegante');
    this.aLink1 = page.locator('.shortsLockupViewModelHostEndpoint');
    this.informacinshoppingButton = page.getByLabel('Mostrar tarjetas');
    this.activarSonidoButton = page.locator('.ytp-unmute');
    this.cancelarButton = page.locator('.ytp-button');
    this.verMsTardeButton = page.getByLabel('Ver más tarde');
    this.compartirButton = page.getByLabel('Compartir');
    this.copiarVnculoButton = page.getByLabel('Copiar vínculo');
    this.enVivoButton = page.locator('.ytp-live-badge');
    this.buttonButton = page.locator('.ytp-chapter-title');
    this.buttonButton1 = page.locator('.ytp-fullerscreen-edu-button');
    this.mediacontainerlinkLink = page.locator('#media-container-link');
  }

}