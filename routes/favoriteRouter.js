const express = require("express");
const Favorite = require("../models/favorite");
const authenticate = require("../authenticate");
const cors = require("./cors");

const favoriteRouter = express.Router();

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, authenticate.verifyUser, (req, res) =>
    res.sendStatus(200)
  )
  .get((req, res, next) => {
    Favorite.find({ user: req.user._id })
      .populate("favorites.user")
      .populate("favorites.campsite")
      .then((favorite) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorite);
      })
      .catch((err) => next(err));
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Favorite.findOne({ user: res.user._id })
        //   Favorite.create(req.body)
        .then((favorite) => {
          if (favorite) {
            req.body.forEach((item) => {
              if (!favorite.campsites.includes(item._id)) {
                favorite.campsites.push(item._id);
              }
            });
            favorite.save().then((favorite) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            });
          } else {
            Favorite.create({ user: req.user._id });
            req.favorite.push(item._id);
          }
        })
        .catch((err) => next(err));
    }
  )
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
  })
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Favorite.findOneAndDelete({ user: req.user._id })
        .then((response) => {
          res.statusCode = 200;
          if (response) {
            res.setHeader("Content-Type", "application/json");
            res.json(response);
          } else {
            res.setHeader("Content-Type", "text/plain");
            res.end("You do not have any favorites to delete.");
          }
        })
        .catch((err) => next(err));
    }
  );

favoriteRouter
  .route("/:campsiteId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res) => {
      res.statusCode = 403;
      res.end("GET operation not allowed for favorites");
    }
  )

  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          if (!favorite.campsites.includes(req.params.campsiteId)) {
            favorite.campsites.push(req.params.campsiteId);
            favorite
              .save()
              .then(() => {
                res.end("Campsite added!");
              })
              .catch((err) => next(err));
          } else {
            res.statusCode = 200;
            res.end("Already a favorite!");
          }
        }
      })
      .catch((err) => next(err));
  })

  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res) => {
      res.statusCode = 403;
      res.end("PUT operation not allowed for favorites");
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Favorite.findOne({ user: req.user._id })
        .then((favorite) => {
          if (favorite) {
            const index = favorite.campsites.indexOf(req.params.campsiteId);
            if (index >= 0) {
              favorite.campsites.splice(index, 1);
            }
            favorite
              .save()
              .then((response) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(response);
              })
              .catch((err) => next(err));
          } else {
            res.statusCode = 403;
            res.end("You don't have favorites!");
          }
        })
        .catch((err) => next(err));
    }
  );

module.exports = favoriteRouter;
