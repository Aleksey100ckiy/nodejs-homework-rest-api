const express = require('express');

const ctrl = require('../../controllers/contacts');

const { validateBody, validateFavoriteBody, authenticate } = require('../../middlewares');

const { schemas } = require('../../models/contact'); 

const router = express.Router();



router.get('/', authenticate, ctrl.getAll);

router.get("/:contactId", authenticate, ctrl.getById);

router.post('/', authenticate, validateBody(schemas.addSchema), ctrl.add);

router.delete('/:contactId', authenticate, ctrl.deleteById);

router.put('/:contactId', authenticate, validateBody(schemas.addSchema), ctrl.updateById);

router.patch('/:contactId/favorite', authenticate, validateFavoriteBody(schemas.updateFavoriteSchema), ctrl.updateFavorite);

module.exports = router;
