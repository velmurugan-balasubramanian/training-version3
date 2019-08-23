$(document).ready(function () {
    app.initialized()
        .then(function (_client) {
            window.client = _client;
            client.events.on('app.activated',
                function () {
                    clickEventHandler();
                });
        });

    function clickEventHandler(){
        $('#createIssue').click(function () {
            getTicketDetails();
        });

        $('#viewIssue').click(function () {
            openModal();
        });
    }

    function getTicketDetails() {
        client.data.get('ticket')
            .then(function (data) {
                let ticket = data.ticket;

                let ticketID = data.ticket.id;
                getIssues().then(function (data) {

                    let issues = data.issues;
                    if (search(ticketID, issues) == false) {

                        CreateIssue(ticket, issues);
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

    function CreateIssue(ticket, issues) {

        headers = {
            Authorization: 'token <%= access_token %>',
            'User-Agent': 'Sample'
        };
        body = JSON.stringify({
            "title": `${ticket.subject}`,
            "body": `${ticket.description_text}`
        });
        options = { headers: headers, isOAuth: true, body: body };
        client.request.post(`https://api.github.com/repos/velmurugan-balasubramanian/Weather-Buddy/issues`, options).then(function (data) {
            data = JSON.parse(data.response);
    
        
            let obj = { ticketID: ticket.id, issueId: data.id, issueNumber:data.number };
            issues.push(obj)
            setData(issues)

        }).catch(function (error) {
            console.error("error", error);

        })
    }

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



    function setData(data) {

        client.db.set("issues", { issues: data })
            .then(function (data) {
                console.log("DAta Save", data);
                showNotification('success', 'success', 'Data Saved Successfully')
            })
            .catch(function (error_data) {
                console.log(error_data);
            });

    }


    function search(searchKey, arrayToBeSearched) {
        let flag = false
        for (var i = 0; i < arrayToBeSearched.length; i++) {
            if (arrayToBeSearched[i].ticketID == searchKey) {
                flag = true;
            }
        }
        console.log("flag", flag);

        return flag;
    }


    function openModal() {

        client.data.get('ticket').then(function (data) {

            client.interface.trigger("showModal", {
                title: "Information Form",
                template: "modal.html",
                data: data.ticket
            });
        })


    }



    function displayButton() {
        client.db.get('issues').then(function (data) {
            let storeddataArray = data.issues;
            console.log('blahbkah');

            client.data.get('ticket').then(function (data) {
                console.log("data", data);
                if (search(data.id, storeddataArray) == false) {
                    console.log('data.ticket.id', data.ticket.id);
                    console.log('storeddataArray', storeddataArray);


                    console.log('inside if');

                    $('#html').append(`<button id="createIssue">Create Issue</button>`)
                }
                else {
                    console.log(' inside else');

                    $('#html').append(`<button id="createIssue">View Issue Details</button>`);
                }

            })


        }).catch(function (error) {
            if (error.status == 404) {
                $('#html').append(`<button id="createIssue">View Issue Details</button>`);
            }
        })

    }

    function showNotification(type, title, message) {
        client.interface.trigger("showNotify", {
            type: `${type}`,
            title: `${title}`,
            message: `${message}`
        }).then(function (data) {
            console.log('succes', data);

        }).catch(function (error) {
            console.log('error', error);
        });
    }
	function deleteDB() {
		client.db.delete("issues").then(
			function (data) {
				console.log("success"+JSON.stringify(data));
			})
			.catch(function (error) {
				console.log("error" + JSON.stringify(error));
			})
	}


});
