describe('R8UC3 – Verify Removal of Todo Entries', () => {
  let testUserId, testUserFullName, testUserEmail;
  
  const DELETION_TASK_NAME = 'Removal Test Container';
  const YOUTUBE_ID = 'kcVRR1Qx4jA';
  const ITEM_TO_REMOVE = 'Item to be deleted 999';

  before(() => {
    cy.fixture('user.json').then((userData) => {
      const urlEncodedData = new URLSearchParams(userData).toString();

      cy.request({
        method: 'POST',
        url: 'http://localhost:5000/users/create',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: urlEncodedData
      }).then((response) => {
        if (![200, 201].includes(response.status)) {
          throw new Error(`User create failed: ${JSON.stringify(response.body)}`);
        }
        const { _id } = response.body;
        testUserId = _id.$oid || _id;
        testUserFullName = userData.firstName + ' ' + userData.lastName;
        testUserEmail = userData.email;
      });
    });
  });

  after(() => {
    if (testUserId) {
      cy.request('DELETE', `http://localhost:5000/users/${testUserId}`);
    }
  });

  beforeEach(() => {
    cy.visit('http://localhost:3000');

    cy.get('input[type="text"]').first().type(testUserEmail);
    cy.get('form').submit();
    cy.contains('h1', `Your tasks, ${testUserFullName}`);

    cy.get('#title').type(DELETION_TASK_NAME);
    cy.get('#url').type(YOUTUBE_ID);
    cy.get('.submit-form input[type="submit"]').click();

    cy.get(`img[src*="${YOUTUBE_ID}"]`).eq(-1).click();

    cy.get('.inline-form').find('input[type="text"]').type(ITEM_TO_REMOVE);
    cy.get('.inline-form').find('input[type="submit"]').click();

    cy.contains('li.todo-item', ITEM_TO_REMOVE).should('be.visible');
  });

  it('successfully removes a todo item via the delete icon', () => {
    cy.intercept('DELETE', '**/todos/byid/*').as('apiDeleteCall');

    cy.contains('.todo-list li.todo-item', ITEM_TO_REMOVE).as('itemRow');

    cy.get('@itemRow')
      .find('.remover')
      .should('be.visible')
      .click({ force: true });

    cy.wait('@apiDeleteCall').then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });

    cy.contains('.todo-list li.todo-item', ITEM_TO_REMOVE).should('not.exist');
  });
});