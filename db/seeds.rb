# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

Course.create({name: 'demo course 1', author_id: 1})
Course.create({name: 'demo course 2', author_id: 1})
Course.create({name: 'demo course 3', author_id: 1})
Course.create({name: 'demo course 4', author_id: 1})
Course.create({name: 'demo course 5', author_id: 1})
Course.create({name: 'demo course 6', author_id: 1})

User.create ({username: 'demoUser', email: 'demoUser@gmail.com', preferred_name: 'demo', user_role: 'demo', pronunciation: 'demo', password: 'hunter2' }) 
#