Feature:
  Testing the blog tab.

  @api @features_first
  Scenario: Test the Blog tab
     Given I visit "john"
      When I click "Blog"
      Then I should see "First blog"

  @api @features_first
  Scenario: Test the Blog archive
    Given I visit "john"
      And I click "Blog"
      And I should see "Blog posts by month"
     When I visit "john/blog/archive/all"
      And I should see "First blog"
      And I visit "john/blog/archive/all/201301"
     Then I should see "January 2013"
      And I should not see "First blog"

  @api @wip
  Scenario: Testing the import of blog from RSS.
    Given I am logging in as "admin"
      And I import the blog for "john"
     When I visit "john/os-importer/blog/manage"
      And I should see "John blog importer"
      And I import the feed item "NASA"
     Then I should see the feed item "NASA" was imported
      And I should see "NASA stands National Aeronautics and Space Administration."

  @api @features_first
  Scenario: Update the created date of a blog to be older than should
            be allowed.
    Given I am logging in as "john"
      And I visit "tesla/node/22/edit"
     When I fill in "Posted on" with "1901-05-30 10:43:58 -0400"
      And I press "Save"
      And I sleep for "2"
     Then I should see "Please enter a valid date for 'Posted on'"
     
 @api @features_first
  Scenario: Update the created date of a blog to be futher in the furture
            than allowed.
    Given I am logging in as "john"
      And I visit "tesla/node/22/edit"
     When I fill in "Posted on" with "3040-05-30 10:43:58 -0400"
      And I press "Save"
      And I sleep for "2"
     Then I should see "Please enter a valid date for 'Posted on'"
