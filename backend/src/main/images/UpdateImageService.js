'use strict';

const jsonValidator = require('jsonschema');
const imageSchema = require('../schema/image.json');
const ImageRepository = require('./ImageRepository');
const ImageMapper = require('./ImageMapper');
const PromiseUtils = require('../utils/PromiseUtils');

class UpdateImageService {

  constructor(databaseManager) {
    this._databaseManager = databaseManager;
    this._imageRepository = new ImageRepository(databaseManager);
  }

  updateImage(id, image, loginData) {
    const connection = this._databaseManager.createConnection();
    let updatePromise = this._updateImage(id, image, loginData, connection);
    const closeConnection = () => this._databaseManager.closeConnection(connection);
    return PromiseUtils.promiseFinally(updatePromise, closeConnection);
  }

  _updateImage(id, imageObject, loginData, connection) {
    // let validationError = this._validate(imageObject);
    // if (validationError) {
    //   return Promise.reject(validationError);
    // }

    let imageEntity = ImageMapper.dtoToEntity(imageObject);
    return this._imageRepository.update(id, imageEntity, connection);
  }

  _validate(data) {
    const validationResult = jsonValidator.validate(data, imageSchema);
    if (validationResult.errors && validationResult.errors.length) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify({"error": validationResult.errors})
      };
    }
  }
}

module.exports = UpdateImageService;