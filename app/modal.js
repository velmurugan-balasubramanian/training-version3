$(document).ready(function () {

  app.initialized()
    .then(
      function (_client) {

        window.client = _client;
        client.instance.context().then(
          function (context) {
            onModalLoad(context.data);
          },
          function (error){
            console.error('error',error);
          }
        );
      });


  /**
   * Function that is triggered on Modal load.
   * @param {object} ticket  ticket that is fetched from parent 
   */
  function onModalLoad(ticket) {
    let ticketID = ticket.id
    getIssues().then(function (data) {
      issueID = search(ticketID, data.issues);
      fetchIssue(issueID);

    })
  }

  /**
   * Helper function get issues from data storage
   */
  function getIssues() {
    let results = client.db.get('issues').then(function (data) {
      return data;
    }).catch(function (error) {
      console.error('error', error);
    })
    return results;
  }



  /**
   * Function to fecth issue from github, authorization is done using Oauth
   * @param {string} issueID  Issue number to query specific  ticket from github
   */
  function fetchIssue(issueID) {

    let headers = {
      Authorization: 'token <%= access_token %>',
      'User-Agent': 'Sample'
    };
    let options = { headers: headers, isOAuth: true };

    client.request.get(`https://api.github.com/repos/velmurugan-balasubramanian/Weather-Buddy/issues/${issueID}`, options).then(function (data) {
      data = JSON.parse(data.response);
      let html = ''
      html = `<h3> Issue title : ${data.title} </h3><p>Description : ${data.body}</p> <p> Issue Number : ${data.number}</p> <p>Issue ID ; ${data.id}</p><p> Issue Status : ${data.state}</p>`

      $('#modal').append(html);

    }).catch(function (error) {
      console.error("error", error);

    })
  }



  /**
   * Helper function to search and return issue number for current ticket and corresponding issue 
   * @param {*} searchKey           Key to be searched
   * @param {*} arrayToBeSearched   Array to be searched for the key
   */
  function search(searchKey, arrayToBeSearched) {

    for (var i = 0; i < arrayToBeSearched.length; i++) {
      if (arrayToBeSearched[i].ticketID == searchKey) {
        let issueNumber = arrayToBeSearched[i].issueNumber;
        return issueNumber;
      }
    }
  }
});
