(function() {

  return {

  	requests: {

  		getGroups: function(){
        return {
    			url: '/api/v2/groups.json',
    			type: 'GET',
    			dataType: 'json'
        };
      },

      getAgents: function(data){
        return{
          url: '/api/v2/search.json?query=type:user group:"' + data + '"',
          type: 'GET',
          dataType: 'json'
        };
      },

      getTicketsByUser: function(user, date_from, date_to){
        return{
          url:'/api/v2/search.json?query=type:ticket assignee:"' + user + '" created>' + date_from + ' created<' + date_to,
          type: 'GET',
          dataType: 'json'
        };

      },

      getTicketsByChannel: function(user, via){
        return{
          url:'/api/v2/search.json?query=type:ticket assignee:"' + user + '" created>2015-01-01 created<2015-12-31 via:"' + via + '"',
          type: 'GET',
          dataType: 'json'
        };
      },

      getTicketsBySatisfaction: function(user, rating){
        return{
          url:'/api/v2/search.json?query=type:ticket assignee:"' + user + '" created>2015-01-01 created<2015-12-31 satisfaction:"' + rating + '"',
          type: 'GET',
          dataType: 'json'
        };
      }
  	},

    events: {
      'app.activated':'loadGroupsAgents',
      'change #groups':'loadAgents',
      'change #agents':'agent_selected',
      'focus #datepicker_from':'showCalendar',
      'focus #datepicker_to':'showCalendar',
      'click #button_via': 'showChannels',
      'change #filter_date':'showDates'
    },

    loadGroupsAgents: function() {
      
      var groups = this.ajax('getGroups');
      var groups_name = new Array();     
      var drop_groups = "<select id='groups'><option value='0'>-- Select group --</option>";


      this.when(groups).then(function(data){

        var groups = data.groups;
        
        _.each(groups, function(data,k){
          drop_groups += "<option value='" + data.name + "'>" + data.name + "</option>";
        });


          this.switchTo('result');
          this.$("#d_groups").html(drop_groups + "</select>");

      });

    },

    loadAgents: function(event_name) {

      var agents_name = new Array();
      var table_agents;

      this.ajax('getAgents',event_name.currentTarget.value).done(function(data){
       
      if(data.results.length > 0){

        var agents = data.results;
        table_agents = "<select id='agents'><option value='0'>-- Select an agent --</option>";
      
        _.each(agents, function(data,k){
            table_agents += "<option value='" + data.name + "'>" + data.name + "</option>";
        });

      }else{
        table_agents = "-- Empty group. --";
      }
        

        this.$("#d_agents").html(table_agents);
        

      });  
    },

    agent_selected:function(event_name){

      var date_from = moment().subtract(30, 'days').format("YYYY-MM-DD");
      var date_to = moment().format("YYYY-MM-DD");

      this.ajax('getTicketsByUser',event_name.currentTarget.value, date_from, date_to).done(function(ti_by_user){

        var table_tickets;//Var containing the result of the search and will display the table
        var by_user = ti_by_user.results;//Total of tickets by user
        var total_result = 10;//Total of results to show
        var cont = 0;
        var v_subdomain = this.currentAccount().subdomain();

        table_tickets = "<div><table>";

        if(by_user.length > 0){

          table_tickets +="<tr><th colspan='4' class='table_result_headers'>All channels</th></tr><tr class='table_result_title'><td>Ticket Id</td><td>Created at</td><td>Subject</td><td>Status</td></tr>";

          _.each(by_user, function(data_mail,k){
              if(cont < total_result){
                table_tickets += "<tr class='colored'><td><a href='https://" + v_subdomain + ".zendesk.com/agent/tickets/" + data_mail.id + "' target='_blank'>" + data_mail.id + "</a></td><td>" + data_mail.created_at + "</td><td>" + data_mail.subject + "</td><td>" + data_mail.status + "</td></tr>";
                cont++;
              }
          });
        }else{

          table_tickets ="<tr><td colspan='3'>No results</td></tr>"; 

        }

        table_tickets += "</table></div>";

        this.$("#tickets").html(table_tickets);
      });


    },

    showCalendar: function(event_name){
        
        dt_name = event_name.currentTarget.id;

        this.$("#" + dt_name).datepicker();
    },



    showChannels:function(){

        this.$("#ticket_via").toggle();

    },

    showDates:function(e){

      if(e.currentTarget.value == "custom"){

        this.$("#ticket_date").toggle();

      }
    }
  };

}());


/*
agent_info: function(event_name){

      //!!FIX AND OPTIMIZE THE SEARCH PART

      var tickets_via_mail = this.ajax('getTicketsByChannel',event_name.currentTarget.value, "mail");
      var tickets_via_chat = this.ajax('getTicketsByChannel',event_name.currentTarget.value, "chat");
      var tickets_sat_good = this.ajax('getTicketsBySatisfaction',event_name.currentTarget.value, "good");
      var tickets_sat_bad = this.ajax('getTicketsBySatisfaction',event_name.currentTarget.value, "bad");
      var v_subdomain = this.currentAccount().subdomain();


      //this.when(tickets_via_mail).then(function(data_mail){
      this.when(tickets_via_mail).then(function(data_mail){
        this.when(tickets_via_chat).then(function(data_chat){
          this.when(tickets_sat_good).then(function(data_good){
            this.when(tickets_sat_bad).then(function(data_bad){

              var table_tickets;//Var containing the result of the search and will display the table
              var via_mail = data_mail.results;//Total of tickets via email
              var via_chat = data_chat.results;//Total of tickets via chat
              var sat_good = data_good.results;//Total of tickets good rating
              var sat_bad = data_bad.results;//Total of tickets bad rating

              var total_result = 3;//Total of results to show
              var cont = 0;

              table_tickets = "<div><table>";

              if(via_mail.length > 0 || via_chat.length > 0 || sat_good.length > 0 || sat_bad.length > 0){

                if(via_mail.length > 0){

                  table_tickets +="<tr><th colspan='4' class='table_result_headers'>Email</th></tr><tr class='table_result_title'><td>Ticket Id</td><td>Created at</td><td>Subject</td><td>Status</td></tr>";

                  _.each(via_mail, function(data_mail,k){
                      if(cont < total_result){
                        table_tickets += "<tr class='colored'><td><a href='https://" + v_subdomain + ".zendesk.com/agent/tickets/" + data_mail.id + "' target='_blank'>" + data_mail.id + "</a></td><td>" + data_mail.created_at + "</td><td>" + data_mail.subject + "</td><td>" + data_mail.status + "</td></tr>";
                        cont++;
                      }
                  });
                }

                if(via_chat.length > 0){
                  cont = 0;
                  table_tickets +="<tr><th colspan='4' class='table_result_headers'>Chat</th></tr><tr class='table_result_title'><td>Ticket Id</td><td>Created at</td><td>Subject</td><td>Status</td></tr>";

                  _.each(via_chat, function(data_chat,k){
                      if(cont < total_result){
                        table_tickets += "<tr class='colored'><td><a href='https://" + v_subdomain + ".zendesk.com/agent/tickets/" + data_chat.id + "' target='_blank'>" + data_chat.id + "</a></td><td>" + data_chat.created_at + "</td><td>" + data_chat.subject + "</td><td>" + data_chat.status + "</td></tr>";
                      }            
                  });
                }

                if(sat_good.length > 0){
                  cont = 0;
                  table_tickets +="<tr><th colspan='4' class='table_result_headers'>Good Satisfaction</th></tr><tr class='table_result_title'><td>Ticket Id</td><td>Created at</td><td>Subject</td><td>Status</td></tr>";

                  _.each(sat_good, function(data_good,k){
                      if(cont < total_result){
                        if(data_good.satisfaction_rating.comment != ""){

                          var v_comment = "<span style='color:red'>c</span>";

                        }
                        table_tickets += "<tr class='colored'><td><a href='https://" + v_subdomain + ".zendesk.com/agent/tickets/" + data_good.id + "' target='_blank'>" + data_good.id + " " + v_comment + "</a></td><td>" + data_good.created_at + "</td><td>" + data_good.subject + "</td><td>" + data_good.status + "</td></tr>";
                      }            
                  });
                }

                if(sat_bad.length > 0){
                  cont = 0;
                  table_tickets +="<tr><th colspan='4' class='table_result_headers'>Bad Satisfaction</th></tr><tr class='table_result_title'><td>Ticket Id</td><td>Created at</td><td>Subject</td><td>Status</td></tr>";

                  _.each(sat_bad, function(data_bad,k){
                      if(cont < total_result){
                        table_tickets += "<tr class='colored'><td><a href='https://" + v_subdomain + ".zendesk.com/agent/tickets/" + data_bad.id + "' target='_blank'>" + data_bad.id + "</a></td><td>" + data_bad.created_at + "</td><td>" + data_bad.subject + "</td><td>" + data_bad.status + "</td></tr>";
                      }            
                  });
                }

              }else{

                table_tickets ="<tr><td colspan='3'>No results</td></tr>"; 

              }

              table_tickets += "</table></div>";

              this.$("#tickets").html(table_tickets);
              

            });
          });
        });
      });
    },

*/