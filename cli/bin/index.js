#!/usr/bin/env node
const {resolve} = require('path');
require('dotenv').config({
  path: process.env.NODE_ENV === 'dev' ?
  resolve(__dirname, '..', '.env') :
  resolve(__dirname, '..', '.env.production')
});
require('../');
