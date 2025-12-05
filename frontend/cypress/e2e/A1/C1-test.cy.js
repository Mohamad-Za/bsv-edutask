describe('R8UC1 – Verify Todo Item Creation Functionality', () => {
  let testUser = {
    id: null,
    displayName: '',
    emailAddress: ''
  };

  before(() => {
    cy.fixture('user.json').then((data) => {
      
      cy.request({
        method: 'POST',
        url: 'http://localhost:5000/users/create',
        form: true, 
        body: data,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.satisfy((code) => code === 200 || code === 201);

        const responseId = response.body._id;
        testUser.id = responseId.$oid || responseId;
        
        testUser.displayName = `${data.firstName} ${data.lastName}`;
        testUser.emailAddress = data.email;
      });
    });
  });

  after(() => {
    if (testUser.id) {
      cy.request('DELETE', `http://localhost:5000/users/${testUser.id}`);
    }
  });

  it('should allow a user to create a task and append a todo item', () => {
    const targetVideoId = 'kcVRR1Qx4jA';
    
    cy.visit('http://localhost:3000');

    cy.get('input[type="text"]').first().type(testUser.emailAddress);
    cy.get('form').first().submit();

    cy.contains(`Your tasks, ${testUser.displayName}`).should('be.visible');

    cy.get('#title').type('Test Task');
    cy.get('#url').type(targetVideoId);
    cy.get('form').submit();

    cy.get(`img[src*="${targetVideoId}"]`).should('exist').click();

    cy.get('.inline-form').find('input[type="text"]').type('Buy milk');
    cy.get('.inline-form').find('input[type="submit"]').click();

    cy.get('.todo-list').should('contain', 'Buy milk');
  });

it('should verify that the add button is disabled when the input is empty (TC2)', () => {
    cy.visit('http://localhost:3000');
    cy.get('input[type="text"]').first().type(testUser.emailAddress);
    cy.get('form').first().submit();

    const targetVideoId = 'kcVRR1Qx4jA';
    cy.get(`img[src*="${targetVideoId}"]`).last().click();

    cy.get('.inline-form').find('input[type="text"]').clear({ force: true });

    cy.get('.inline-form').find('input[type="submit"]').should('be.disabled');
  });

});