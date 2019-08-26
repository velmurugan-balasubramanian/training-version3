$(document).ready(function () {
    app.initialized()
        .then(function (_client) {
            window.client = _client;
            client.events.on('app.activated',
                function () {
                    clickEventHandler();
                });
        },
        function(error){
            console.error('Error'+ error); 
        });


    /**
     * Function that triggered on app load, with all event handlers
     */
    function clickEventHandler(){
        $('#createIssue').click(function () {
            createIssue();
        });

        $('#viewIssue').click(function () {
            viewIssue();
        });
    }


    /**
     *  Function to crate a Github Issue
     */
    function createIssue() {
        getTicketDetails()
            .then(function (data) {
                let ticket = data.ticket;

                let ticketID = data.ticket.id;
                getIssues().then(function (data) {

                    let issues = data.issues;
                    if (search(ticketID, issues) == false) {

                        CreateIssueHelper(ticket, issues);
                    }
                    else {
                        showNotification('danger', 'Warning', 'Github issue for this ticket has already been created');
                    }

                }).catch(function (error) {
                    console.error(error);
                })
            })
            .catch(function (error) {
                console.error(error);
            });
    }


    /**
     *  Function to View issue in the modal, Passes ticket as an object to the modal, can be fetched in the modal using instance api
     */
    function viewIssue() {

        getTicketDetails().then(function (data) {

            client.interface.trigger("showModal", {
                title: "Information Form",
                template: "modal.html",
                data: data.ticket
            });
        },
        function(error){
            console.error('Error'+error);
            
        })
    }


    /**
     * Helper Function to create issue in Github
     * @param {*} ticket // Ticket Object 
     * @param {*} issues // Issyues Array
     */
    function CreateIssueHelper(ticket, issues) {

        let headers = {
            Authorization: 'token <%= access_token %>',
            'User-Agent': 'Sample'
        };
        let body = JSON.stringify({
            "title": `${ticket.subject}`,
            "body": `${ticket.description_text}`
        });
        let options = { headers: headers, isOAuth: true, body: body };
        client.request.post(`https://api.github.com/repos/velmurugan-balasubramanian/Weather-Buddy/issues`, options).then(function (data) {
            let response = data;
            response = JSON.parse(data.response);
            let obj = { ticketID: ticket.id, issueId: response.id, issueNumber: response.number };
            issues.push(obj)
            setData(issues)

        }).catch(function (error) {
            console.error("error", error);

        })
    }


    /**
     *  Helper Function to Fetch the current ticket details 
     */
    function getTicketDetails(){
        
      let ticket =  client.data.get('ticket').then(
        function(data){
            return data;
        })
        .catch(function(error){
            return error;
        })
        return ticket;
    }


    /**
     *  Helper function to fetch issue object from data storage
     */
    function getIssues() {
        let results =
            client.db.get('issues').then(function (data) {
                return data;
            }).catch(function (error) {
                if (error.status == 404) {
                    setData([{ issueId: 123456789, ticketID: 01 }]);
                }

            })
        return results;
    }


    /**
     * Helper function to setdate in data storage
     * @param {array} data  Issue array to be set in data storage
     */
    function setData(data) {

        client.db.set("issues", { issues: data })
            .then(function () {
                
                showNotification('success', 'success', 'Issue Created successfully')
            })
            .catch(function (error_data) {
                console.error(error_data);
            });

    }


    /**
     * 
     * @param {string} searchKey            // key to be sarched in array
     * @param {array} arrayToBeSearched     // Array in which the key to be set
     */
    function search(searchKey, arrayToBeSearched) {
        let flag = false
        for (var i = 0; i < arrayToBeSearched.length; i++) {
            if (arrayToBeSearched[i].ticketID == searchKey) {
                flag = true;
            }
        }
        return flag;
    }


    /**
     * Function to show notification to the user in the front end
     * @param {string} type     Type of error message 
     * @param {string} title    Title of the message
     * @param {string} message  Notification message
     */

    function showNotification(type, title, message) {
        client.interface.trigger("showNotify", {
            type: `${type}`,
            title: `${title}`,
            message: `${message}`
        }).then(function (data) {
            console.info('succes', data);

        }).catch(function (error) {
            console.error('error', error);
        });
    }


});
