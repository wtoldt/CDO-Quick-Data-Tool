import { CdoQuickDataToolPage } from './app.po';

describe('cdo-quick-data-tool App', () => {
  let page: CdoQuickDataToolPage;

  beforeEach(() => {
    page = new CdoQuickDataToolPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
