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

Subject.create({name: 'demo subject 100', authorId: 1, courseId: 1})
Subject.create({name: 'demo subject 2', authorId: 1, courseId: 2})
Subject.create({name: 'demo subject 3', authorId: 1, courseId: 3})
Subject.create({name: 'demo subject 4', authorId: 1, courseId: 4})
Subject.create({name: 'demo subject 5', authorId: 1, courseId: 5})
Subject.create({name: 'demo subject 6', authorId: 1, courseId: 6})

Task.create({name: 'demo task 1', author_id: 1, subject_id: 1, body: "this is task 1  ", duration: 300, completed: true })
Task.create({name: 'demo task 2', author_id: 1, subject_id: 2, body: "this is task 2  ", duration: 40, completed: true })
Task.create({name: 'demo task 3', author_id: 1, subject_id: 3, body: "this is task 3  ", duration: 900, completed: true })
Task.create({name: 'demo task 4', author_id: 1, subject_id: 4, body: "this is task 4  ", duration: 480, completed: true })
Task.create({name: 'demo task 5', author_id: 1, subject_id: 5, body: "this is task 5  ", duration: 12, completed: true })
Task.create({name: 'demo task 6', author_id: 1, subject_id: 6, body: "this is task 6  ", duration: 700, completed: true })

User.create ({username: 'demoUser', email: 'demoUser@gmail.com', preferred_name: 'demo', user_role: 'demo', pronunciation: 'demo', password: 'hunter2' }) 

