'use strict';

var common = require('@nestjs/common');

const IsPublicMetaKey = 'isPublic';
const IsPublic = () => common.SetMetadata('IsPublicMetaKey', true);

exports.IsPublic = IsPublic;
exports.IsPublicMetaKey = IsPublicMetaKey;
