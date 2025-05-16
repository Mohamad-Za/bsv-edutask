describe('R8UC3 – Delete Todo Item', () => {
  let userId, userName, userEmail;
  const TASK_TITLE = 'Delete Test Task';
  const VIDEO_KEY  = 'kcVRR1Qx4jA';

  before(() => {
    cy.fixture('user.json').then(u => {
      userEmail = u.email;
      userName  = `${u.firstName} ${u.lastName}`;
      cy.request({
        method: 'POST',
        url:    'http://localhost:5000/users/create',
        form:   true,
        body:   u
      }).its('body._id.$oid').as('uid');
    });
    cy.get('@uid').then(id => (userId = id));
  });

  after(() => {
    if (userId) {
      cy.request({
        method:           'DELETE',
        url:              `http://localhost:5000/users/${userId}`,
        failOnStatusCode: false
      });
    }
  });

  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.contains('div', 'Email Address')
      .find('input[type="text"]').type(userEmail);
    cy.get('form').submit();
    cy.contains('h1', `Your tasks, ${userName}`);

    cy.get('.inputwrapper #title').type(TASK_TITLE);
    cy.get('.inputwrapper #url').type(VIDEO_KEY);
    cy.get('.submit-form.bordered input[type="submit"]').click();
    cy.get(`img[src*="${VIDEO_KEY}"]`).last().click();

    cy.get('.todo-list li.todo-item').should('have.length.at.least', 1);
  });

  it('deletes a todo item when clicking the × remover', () => {
    cy.intercept('DELETE', '**/todos/byid/*').as('deleteTodo');

    cy.get('.todo-list li.todo-item')
      .first()
      .as('firstTodo')
      .find('.remover').click({ force: true })
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });

    cy.wait('@deleteTodo').its('response.statusCode').should('eq', 200);

  });
});
