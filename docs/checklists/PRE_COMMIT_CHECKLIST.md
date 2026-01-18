# Pre-Commit Checklist

**Version:** 1.0.0
**Last Updated:** January 2026

---

## Before Every Commit

### Code Quality
- [ ] Code follows project coding standards
- [ ] No console.log, puts, or debug statements left in code
- [ ] No commented-out code blocks
- [ ] Variable and function names are descriptive
- [ ] No hardcoded values (use environment variables)

### Ruby/Rails Backend
- [ ] Follows Rails conventions
- [ ] Models have appropriate validations
- [ ] Controllers are thin (logic in models/services)
- [ ] No N+1 queries (use includes/eager loading)

### React Frontend
- [ ] Components follow established patterns
- [ ] Redux actions/reducers properly structured
- [ ] No unused imports

### Testing
- [ ] All existing tests pass (`bundle exec rails test`)
- [ ] New code has corresponding tests
- [ ] Edge cases are covered

### Security
- [ ] No API keys or secrets in code
- [ ] No sensitive data logged
- [ ] Strong parameters used in controllers
- [ ] Input validation implemented

### Documentation
- [ ] Complex logic has inline comments
- [ ] README updated if needed
- [ ] API documentation updated if endpoints changed

### Git Hygiene
- [ ] Commit message is descriptive and follows conventions
- [ ] Changes are atomic (single logical change per commit)
- [ ] No unrelated changes bundled together
- [ ] Branch is up to date with main

---

## Quick Commands

```bash
# Run Rails tests
bundle exec rails test

# Run linter
bundle exec rubocop

# Check for security issues
bundle exec brakeman
```
