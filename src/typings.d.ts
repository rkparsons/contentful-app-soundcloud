import { AppExtensionSDK, FieldExtensionSDK } from 'contentful-ui-extensions-sdk';

export interface AppConfigParams {
  sdk: AppExtensionSDK;
}

export interface SavedParams {
  clientId: string;
}

export interface FieldExtensionProps {
  sdk: FieldExtensionSDK;
}
