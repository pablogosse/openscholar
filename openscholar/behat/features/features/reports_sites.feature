Feature:
  Testing the OS Reports for sites feature

  @api @wip
  Scenario: Trying to view the report form without the proper access
      Given I am logging in as a user who "can't" "access os reports"
       Then I can't visit "/admin/reports/os/site"

  @api @wip
  Scenario: Trying to view the report form with the proper access
      Given I am logging in as a user who "can" "access os reports"
        And I go to "/admin/reports/os/site"
       Then I should see the text "Sites Report"

  @api @wip
  Scenario: Running a site report with all available optional columns
      Given I am logging in as a user who "can" "access os reports"
        And I run the "site" report with "Optional Columns" <checked>:
            | Subdomain of site owner      |
            | Creation date                |
            | Created by                   |
            | Date of last content update  |
            | Privacy level                |
            | Custom domain                |
            | Custom theme uploaded        |
            | Site type/preset             |
       Then I will see a report with content in the following <columns>:
            | site title            | populated       |
            | site url              | populated       |
            | os install            | populated       |
            | site owner email      | populated       |
            | owner subdomain       | may be blank    |
            | site created          | populated       |
            | content last updated  | may be blank    |
            | site created by       | populated       |
            | site privacy setting  | populated       |
            | custom domain         | populated       |
            | custom theme uploaded | populated       |
            | preset                | populated       |

  @api @wip
  Scenario: Running a site report that searches site owner email addresses for a keyword
      Given I am logging in as a user who "can" "access os reports"
        And I run the "site" report with "keyword" set to "gov" and <checkboxes> selected:
            | email |
       Then I will see a report with the following <rows>:
            | site title | site url | site owner email   | os install |
            | Edison     | edison   | alexander@bell.gov |            |
            | John       | john     | jfk@whitehouse.gov |            |
            | Obama      | obama    | jfk@whitehouse.gov |            |
            | Abraham    | lincoln  | jfk@whitehouse.gov |            |
            | Einstein   | einstein | jfk@whitehouse.gov |            |
            | Tesla      | tesla    | jfk@whitehouse.gov |            |

  @api @wip
  Scenario: Running a site report that searches site owner email addresses for a keyword
      Given I am logging in as a user who "can" "access os reports"
        And I run the "site" report with "keyword" set to "john" and <checkboxes> selected:
            | username |
       Then I will see a report with the following <rows>:
            | site title | site url | site owner email   | os install |
            | John       | john     | jfk@whitehouse.gov |            |
            | Obama      | obama    | jfk@whitehouse.gov |            |
            | Abraham    | lincoln  | jfk@whitehouse.gov |            |
            | Einstein   | einstein | jfk@whitehouse.gov |            |
            | Tesla      | tesla    | jfk@whitehouse.gov |            |

  @api @wip
  Scenario: Running a site report that searches site owner email addresses for a keyword
      Given I am logging in as a user who "can" "access os reports"
        And I run the "site" report with "keyword" set to "john" and <checkboxes> selected:
            | site name |
       Then I will see a report with the following <rows>:
            | site title | site url | site owner email   | os install |
            | John       | john     | jfk@whitehouse.gov |            |

  @api @wip
  Scenario: Running a site report that searches site owner email addresses for a keyword
      Given I am logging in as a user who "can" "access os reports"
        And I run the "site" report with "keyword" set to "Rumpelstiltskin" and <checkboxes> selected:
            | email     |
            | username  |
            | site name |
       Then I will see a report with no results

  @api @wip
  Scenario: Running a site report limited by content last updated dates
      Given I am logging in as a user who "can" "access os reports"
        And I run the "site" report with "Content last updated before" set to the "beginning" of this "year"
       Then I will see a report with no results

  @api @wip
  Scenario: Running a site report limited by content last updated dates
      Given I am logging in as a user who "can" "access os reports"
        And I run the "site" report with "Content last updated before" set to the "end" of this "year"
       Then I will see a report with "content last updated" values "less than or equal" to the "end" of this "year"

  @api @wip
  Scenario: Running a site report limited by site creation date start
      Given I am logging in as a user who "can" "access os reports"
        And I run the "site" report with "Creation start" set to the "beginning" of this "year"
       Then I will see a report with "site created" values "greater than or equal" to the "beginning" of this "year"

  @api @wip
  Scenario: Running a site report limited by site creation date end
      Given I am logging in as a user who "can" "access os reports"
        And I run the "site" report with "Creation start" set to the "end" of this "year"
       Then I will see a report with no results

  @api @wip
  Scenario: Running a site report limited by site creation date end
      Given I am logging in as a user who "can" "access os reports"
        And I run the "site" report with "Creation end" set to the "beginning" of this "year"
       Then I will see a report with no results

  @api @wip
  Scenario: Running a site report limited by site creation date start
      Given I am logging in as a user who "can" "access os reports"
        And I run the "site" report with "Creation end" set to the "end" of this "year"
       Then I will see a report with "site created" values "less than or equal" to the "end" of this "year"
