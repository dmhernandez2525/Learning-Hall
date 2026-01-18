# Code Review Checklist

**Version:** 1.0.0
**Last Updated:** January 2026

---

## For Reviewers

### Functionality
- [ ] Code does what it's supposed to do
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] No breaking changes to existing functionality

### Code Quality
- [ ] Code is readable and self-documenting
- [ ] Follows Rails/React conventions and patterns
- [ ] No code duplication (DRY principle)
- [ ] Functions are focused and single-purpose
- [ ] Appropriate abstractions used

### Rails Backend
- [ ] Controllers are thin
- [ ] Models contain business logic
- [ ] Proper use of callbacks and validations
- [ ] RESTful route design

### React Frontend
- [ ] Components are reusable
- [ ] Redux patterns followed
- [ ] Proper state management
- [ ] No prop drilling

### Security
- [ ] No security vulnerabilities introduced
- [ ] Authentication/authorization correct
- [ ] Strong parameters used
- [ ] No mass assignment vulnerabilities

### Testing
- [ ] Tests cover the changes adequately
- [ ] Tests are meaningful (not just coverage)
- [ ] Test names are descriptive
- [ ] Fixtures/factories used appropriately

### Performance
- [ ] No N+1 queries
- [ ] Pagination used for lists
- [ ] Caching considered where appropriate
- [ ] Indexes added for queries

### Documentation
- [ ] Code comments explain "why" not "what"
- [ ] Public APIs documented
- [ ] README updated if needed

---

## Review Response Guidelines

### Approval Criteria
- All critical issues addressed
- No security vulnerabilities
- Tests pass and cover changes
- Code is maintainable

### Comment Types
- **Blocking**: Must be fixed before merge
- **Suggestion**: Consider for improvement
- **Question**: Clarification needed
- **Nitpick**: Minor style preference
