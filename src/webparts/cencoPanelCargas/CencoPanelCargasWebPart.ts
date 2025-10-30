import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import CencoPanelCargas, { type ICencoPanelCargasProps } from './components/CencoPanelCargas';

export interface ICencoPanelCargasWebPartProps {
  docsUrl: string;
  vehiclesUrl: string;
  peopleUrl: string;
}

export default class CencoPanelCargasWebPart
  extends BaseClientSideWebPart<ICencoPanelCargasWebPartProps> {

  public render(): void {
    const element: React.ReactElement<ICencoPanelCargasProps> =
      React.createElement(CencoPanelCargas, {
        docsUrl: this.properties.docsUrl,
        vehiclesUrl: this.properties.vehiclesUrl,
        peopleUrl: this.properties.peopleUrl
      });

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: 'URLs de páginas de carga' },
          groups: [
            {
              groupFields: [
                PropertyPaneTextField('docsUrl', { label: 'URL - Documentos' }),
                PropertyPaneTextField('vehiclesUrl', { label: 'URL - Vehículos' }),
                PropertyPaneTextField('peopleUrl', { label: 'URL - Personas' })
              ]
            }
          ]
        }
      ]
    };
  }
}
