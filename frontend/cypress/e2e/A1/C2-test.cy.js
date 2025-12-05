describe('R8UC2 – Check Todo Item Toggling', () => {
  let currentUserId, currentUserName, currentUserEmail;
  const TEST_TASK = 'Toggle Test Task';
  const YOUTUBE_ID = 'kcVRR1Qx4jA';

  before(() => {
    cy.fixture('user.json').then((userData) => {
      const urlEncodedBody = new URLSearchParams(userData).toString();

      cy.request({
        method: 'POST',
        url: 'http://localhost:5000/users/create',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: urlEncodedBody,
        failOnStatusCode: false
      }).then((response) => {
        if (![200, 201].includes(response.status)) {
          throw new Error(`Failed to create user. Server responded: ${JSON.stringify(response.body)}`);
        }

        const { _id } = response.body;
        currentUserId = _id.$oid || _id;
        currentUserName = `${userData.firstName} ${userData.lastName}`;
        currentUserEmail = userData.email;
      });
    });
  });

  after(() => {
    if (currentUserId) {
      cy.request('DELETE', `http://localhost:5000/users/${currentUserId}`);
    }
  });

  beforeEach(() => {
    cy.visit('http://localhost:3000');

    cy.contains('Email Address').parent().find('input[type="text"]').type(currentUserEmail);
    cy.get('form').submit();

    cy.contains('h1', `Your tasks, ${currentUserName}`);

    cy.get('.inputwrapper').find('#title').type(TEST_TASK);
    cy.get('.inputwrapper').find('#url').type(YOUTUBE_ID);
    
    cy.get('.submit-form.bordered').find('input[type="submit"]').click();

    cy.get(`img[src*="${YOUTUBE_ID}"]`).last().click();
    cy.get('.todo-list li.todo-item').first().as('targetItem');
  });

  it('verifies that an active todo becomes completed (checked style applied)', () => {
    cy.get('@targetItem')
      .find('.checker')
      .should('have.class', 'unchecked')
      .click()
      .should('have.class', 'checked');

    cy.get('@targetItem')
      .find('span')
      .eq(1)
      .should('have.css', 'text-decoration-line', 'line-through');
  });

  it('verifies that a completed todo becomes active (checked style removed)', () => {
    cy.get('@targetItem').find('.checker').then(($el) => {
      if (!$el.hasClass('checked')) {
        cy.wrap($el).click();
      }
    });

    cy.get('@targetItem')
      .find('.checker.checked')
      .click()
      .should('have.class', 'unchecked');

    cy.get('@targetItem')
      .find('span')
      .eq(1)
      .should('have.css', 'text-decoration-line', 'none');
  });
});