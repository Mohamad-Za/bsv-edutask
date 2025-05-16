describe("Loggin, create task, ValidToDO", () => {
    let userId; 
    let userName;
    let userEmail;
  
    before(function () {
      cy.fixture("user.json").then((user) => {
        cy.request({
          method: "POST",
          url: "http://localhost:5000/users/create",
          form: true,
          body: user,
        }).then((response) => {
          userId = response.body._id.$oid;
          userName = `${user.firstName} ${user.lastName}`;
          userEmail = user.email;
        });
      });
    });
  
    beforeEach(function () {
      cy.visit("http://localhost:3000");
      cy.contains("div", "Email Address").find("input[type=text]").type(userEmail);
      cy.get("form").submit();
    });
  
    it("create todo with Valid describtion", () => {
      cy.get("h1").should("contain.text", "Your tasks, " + userName);
  
      const taskTitle = "Test Task Title";
      const videoId = "kcVRR1Qx4jA";
  
      cy.get(".inputwrapper #title").type(taskTitle);
      cy.get(".inputwrapper #url").type(videoId);
      cy.get("form").submit();
  
      cy.contains(taskTitle).should("exist");
  
      cy.get(`img[src*="${videoId}"]`).should("exist");
  
      cy.get(`img[src*="${videoId}"]`).click();
      cy.get("li.todo-item").should("have.length", 1);
  
      cy.get(".inline-form input[type=text]").type("Buy milk");
      cy.get(".inline-form input[type=submit]").click();
  
      cy.get("ul.todo-list").contains("Buy milk").should("exist");
      cy.get("li.todo-item").should("have.length", 2);
    });
  
    it("create todo with empty describtion", () => {
      const taskTitle = "sec Task Title2";
      const videoId = "5954ZGgPa04";
  
      cy.get(".inputwrapper #title").type(taskTitle);
      cy.get(".inputwrapper #url").type(videoId);
      cy.get("form").submit();
  
      cy.contains(taskTitle).should("exist");
  
      cy.get(`img[src*="${videoId}"]`).should("exist");
  
      cy.get(`img[src*="${videoId}"]`).click();
  
      cy.get(".inline-form").find("input[type=submit]").click();
  
      cy.wait(1000);
  
      cy.get("li.todo-item").should("have.length", 1); 
    });
  
    after(function () {
      cy.request({
        method: "DELETE",
        url: `http://localhost:5000/users/${userId}`,
      }).then((response) => {
        cy.log(response.body);
      });
    });
  });