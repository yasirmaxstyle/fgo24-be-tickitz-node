const express = require("express");
const router = express.Router();

const movieAdminController = require("../controllers/admin.controller");
const upload = require("../middlewares/upload");

const {
  createMovieValidation,
  updateMovieValidation,
  getMovieValidation,
  deleteMovieValidation
} = require("../middlewares/validations/movieAdminValidation");

const { authMiddleware, adminMiddleware } = require("../middlewares/auth.middleware");

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/movies", movieAdminController.getAllMovies);
router.get("/movies/stats", movieAdminController.getMovieStats);
router.get("/movies/:id", getMovieValidation, movieAdminController.getMovieById);

router.post("/movies",
  upload.single("movie"),
  createMovieValidation,
  movieAdminController.createMovie);

router.patch("/movies/:id",
  upload.single("movie"),
  updateMovieValidation,
  movieAdminController.updateMovie);

router.delete("/movies/:id", deleteMovieValidation, movieAdminController.deleteMovie);

module.exports = router;
