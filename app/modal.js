$(document).ready(function () {
  console.log('Modal ');
  
  app.initialized()
    .then(
      function (_client) {
        console.log('app initialized');
        
      window.client = _client;
      client.instance.context().then(
        function(context)  {
          console.log("Modal instance API context", context.data.id);
          onLoadOperations(context.data);
          /* Output: Modal instance API context { instanceId: "4",   location: "modal", parentId: "1", modalData: {name: "James", email: "James@freshdesk.com"} }" */
        }
      );
        
    });

    function onLoadOperations(ticket){
      let  ticketID = ticket.id
      console.log('Ticket',ticket);
      
      getIssues().then(function(data){
        console.log('data',data);
        console.log('search',search(ticketID,data.issues));
        
        issueID = search(ticketID,data.issues);

        console.log('issueID',issueID);
        fetchIssue(issueID);
        
      })


    }

      function getIssues() {
        let results = client.db.get('issues').then(function (data) {
                return data;
            }).catch(function (error) {
            })
        return results;
    }


    function fetchIssue(issueID) {
      console.log('inside FEtchIssue');
      let html = ''
      headers = {
          Authorization: 'token <%= access_token %>',
          'User-Agent': 'Sample'
      };
      options = { headers: headers, isOAuth: true };
      
      client.request.get(`https://api.github.com/repos/velmurugan-balasubramanian/Weather-Buddy/issues/${issueID}`, options).then(function (data) {
          data = JSON.parse(data.response);
          console.log('data of one issue', data);

            html = `<h3> Issue title : ${data.title} </h3><p>Description : ${data.body}</p> <p> Issue Number : ${data.number}</p> <p>Issue ID ; ${data.id}</p><p> Issue Status : ${data.state}</p>`

            $('#modal').append(html);

      }).catch(function (error) {
          console.log("error", error);

      })
  }

  function search(searchKey, arrayToBeSearched) {
  
    for (var i = 0; i < arrayToBeSearched.length; i++) {
        if (arrayToBeSearched[i].ticketID == searchKey) {
          console.log('arrayToBeSearched[i].ticketID',arrayToBeSearched[i].ticketID);
          console.log('arrayToBeSearched[i].issueId',arrayToBeSearched[i].issueNumber);
          
          issueID = arrayToBeSearched[i].issueNumber;
          console.log('issueId',issueID);
          
            return issueID;
        }
    }
}
});
