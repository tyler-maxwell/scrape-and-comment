var request = require("request");
var cheerio = require("cheerio");
var db = require("../models");

module.exports = function(app) {
  // Route for scraping articles
  app.get("/scrape", function(req, res) {
    request("https://theconversation.com/us", function(error, response, html) {
      var $ = cheerio.load(html);

      $("article").each(function(i, element) {
        var result = {};

        result.title = $(this)
          .children("header")
          .children("div")
          .children("h2")
          .children("a")
          .text();
        result.link = $(this)
          .children("header")
          .children("div")
          .children("h2")
          .children("a")
          .attr("href");
        result.summary = $(this)
          .children("div")
          .children("span")
          .text();

        console.log(result);

        // Check for existing article in database
        db.Article.findOne({ title: result.title }).then(function(dbArticle) {
          if (dbArticle) {
            console.log("Article already in database");
          } else {
            db.Article.create(result).then(function(dbArticle) {
              console.log(dbArticle);
            });
          }
        });
      });

      res.json("Scrape Complete");
    });
  });

  // Route for getting all Articles from the db
  app.get("/articles", function(req, res) {
    db.Article.find({})
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

  // Route for grabbing a specific Article by id, populate it with it's comments
  app.get("/articles/:id", function(req, res) {
    db.Article.findOne({ _id: req.params.id })
      .populate("comments")
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

  // Route for saving/updating an Article's associated comments
  app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function(dbNote) {
        // Update the Article to be associated with the new Note
        return db.Article.findOneAndUpdate(
          { _id: req.params.id },
          { $push: { comments: dbNote._id } },
          { new: true }
        );
      })
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

  // Route for removing comments and an Article's associated comments
  app.post("/notes/:id", function(req, res) {
    var noteId = req.params.id;
    var articleId = req.body.articleId;

    db.Note.deleteOne({ _id: noteId })
      .then(function(result) {
        return db.Article.findOneAndUpdate(
          { _id: articleId },
          { $pull: { comments: noteId } },
          { new: true }
        );
      })
      .then(function(dbArticle) {
        console.log(dbArticle);
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });
};
