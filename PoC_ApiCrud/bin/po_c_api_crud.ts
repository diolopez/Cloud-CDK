#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { PoCApiCrudStack } from '../lib/po_c_api_crud-stack';

const app = new cdk.App();
new PoCApiCrudStack(app, 'PoCApiCrudStack');
