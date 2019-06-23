'use strict';

const ImageRepository = require('./ImageRepository');
const ImageMapper = require('./ImageMapper');
const PromiseUtils = require('../utils/PromiseUtils');

class ListImagesService {

  constructor(databaseManager) {
    this._databaseManager = databaseManager;
    this._imageRepository = new ImageRepository(databaseManager);
  }

  listImages(query, loginData) {
    const connection = this._databaseManager.createConnection();

    const listImagesPromise = this._listImages(query, loginData, connection)
      .then(images => images.map(ImageMapper.entityToDto));
    const closeConnection = () => this._databaseManager.closeConnection(connection);
    return PromiseUtils.promiseFinally(listImagesPromise, closeConnection);
  }

  _listImages(query, loginData, connection) {
    return this._imageRepository.list(connection);
  }

}


module.exports = ListImagesService;