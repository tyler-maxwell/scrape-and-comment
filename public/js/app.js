$(function() {
  // Get articles on page load
  $.getJSON("/articles", function(data) {
    for (let i = 0; i < data.length; i++) {
      // Create Bootstrap card
      let card = $("<div>");
      card.attr("class", "card");
      card.attr("data-id", data[i]._id);

      // Card title and link
      let head = $("<h5>");
      head.attr("class", "card-header");
      let headText = $("<a>");
      headText.attr("href", "https://theconversation.com" + data[i].link);
      headText.text(data[i].title);
      head.append(headText);

      // Card summary and comment button
      let body = $("<div>");
      body.attr("class", "card-body");
      let summary = $("<p>");
      summary.attr("class", "card-text");
      summary.text(data[i].summary);
      body.append(summary);
      let commentBtn = $("<button>");
      commentBtn.attr("class", "btn btn-primary commentBtn");
      commentBtn.attr("data-id", data[i]._id);
      commentBtn.attr("data-toggle", "modal");
      commentBtn.attr("data-target", "#commentsModal");
      commentBtn.text("Comments");
      body.append(commentBtn);

      // Append head and body to card
      card.append(head);
      card.append(body);

      // Append card to page
      $("#articles").append(card);
    }
  });

  // Scrape articles button
  $(document).on("click", "#scrapeBtn", function() {
    $.ajax({
      method: "GET",
      url: "/scrape"
    }).then(function(result) {
      location.reload();
    });
  });

  // Comments button
  $(document).on("click", ".commentBtn", function() {
    $("#write-comment").empty();
    $("#comments").empty();

    var thisId = $(this).attr("data-id");

    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    }).then(function(data) {
      console.log(data);
      $("#comments-header").text(data.title);
      $("#write-comment").append(
        "<input id='username-input' name='username' >"
      );
      $("#write-comment").append(
        "<textarea id='bodyinput' name='body'></textarea>"
      );
      $("#write-comment").append(
        "<button data-id='" +
          data._id +
          "' id='save-comment'>Save Note</button>"
      );

      console.log(data.comments);
      if (data.comments) {
        data.comments.forEach(note => {
          let p = $("<p>").text(note.body);
          $("#comments").append(p);
        });
      }
    });
  });

  // When you click the save-comment button
  $(document).on("click", "#save-comment", function() {
    var thisId = $(this).attr("data-id");

    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        username: $("#username-input").val(),
        body: $("#bodyinput").val()
      }
    })
      // With that done
      .then(function(data) {
        console.log(data);
        $("#notes").empty();
      });

    // Also, remove the values entered in the input and textarea for note entry
    $("#username-input").val("");
    $("#bodyinput").val("");
  });
});
