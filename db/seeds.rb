# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
require "faker"

10.times do |i|
    invention = Faker::TvShows::StarTrek.specie

    Course.create({name: invention, author_id: 1})
    10.times do 
        motto = Faker::TvShows::MichaelScott.quote 
        Subject.create({name: motto, authorId: 1, courseId: i + 2 })
        10.times do 
            motto2 = Faker::Movies::HitchhikersGuideToTheGalaxy
            mk = Faker::Markdown.random 
            Task.create({ name:motto2 , author_id: 1, subject_id: 1, body:mk, duration: 300, completed: true })

        end

    end

end



# Course.create({name: 'demo course 1', author_id: 1})
# Course.create({name: 'demo course 2', author_id: 1})
# Course.create({name: 'demo course 3', author_id: 1})
# Course.create({name: 'demo course 4', author_id: 1})
# Course.create({name: 'demo course 5', author_id: 1})
# Course.create({name: 'demo course 6', author_id: 1})

# Subject.create({name: 'demo subject 100', authorId: 1, courseId: 1})
# Subject.create({name: 'demo subject 2', authorId: 1, courseId: 2})
# Subject.create({name: 'demo subject 3', authorId: 1, courseId: 3})
# Subject.create({name: 'demo subject 4', authorId: 1, courseId: 4})
# Subject.create({name: 'demo subject 5', authorId: 1, courseId: 5})
# Subject.create({name: 'demo subject 6', authorId: 1, courseId: 6})



Task.create({
    name: 'demo task no MarkDown',
    author_id: 1,
    subject_id: 1,
    body: "this is a task without markdown  ",
    duration: 300,
    completed: true
 })

Task.create({
    name: 'demo task Text using Markdown syntax',
    author_id: 1,
    subject_id: 2,
    body: '
    Heading
=======

## Sub-heading

Paragraphs are separated
by a blank line.

Two spaces at the end of a line  
produces a line break.

Text attributes _italic_, 
**bold**, `monospace`.

Horizontal rule:

---

Bullet list:

  * apples
  * oranges
  * pears

Numbered list:

  1. lather
  2. rinse
  3. repeat

An [example](http://example.com).

![Image](Icon-pictures.png "icon")

> Markdown uses email-style > characters for blockquoting.

Inline <abbr title="Hypertext Markup Language">HTML</abbr> is supported.',
    duration: 40,
    completed: true
})

Task.create({
    name: 'demo task just html',
    author_id: 1,
    subject_id: 3,
    body: '
    <h1>Heading</h1>

<h2>Sub-heading</h2>

<p>Paragraphs are separated
by a blank line.</p>

<p>Two spaces at the end of a line<br />
produces a line break.</p>

<p>Text attributes <em>italic</em>, 
<strong>bold</strong>, <code>monospace</code>.</p>

<p>Horizontal rule:</p>

<hr />

<p>Bullet list:</p>

<ul>
<li>apples</li>
<li>oranges</li>
<li>pears</li>
</ul>

<p>Numbered list:</p>
demoUser
<ol>
<li>lather</li>
<li>rinse</li>
<li>repeat</li>
</ol>

<p>An <a href="http://example.com">example</a>.</p>

<p><img alt="Image" title="icon" src="Icon-pictures.png" /></p>

<blockquote>
<p>Markdown uses email-style &gt; characters for blockquoting.</p>
</blockquote>

<p>Inline <abbr title="Hypertext Markup Language">HTML</abbr> is supported.</p>',
    duration: 900,
    completed: true
})

Task.create({
    name: 'demo task Headers',
    author_id: 1,
    subject_id: 4,
    body:  '
# H1
## H2
### H3
#### H4
##### H5
###### H6

Alternatively, for H1 and H2, an underline-ish style:

Alt-H1
======

Alt-H2
------',
    duration: 480,
    completed: true
})

Task.create({
    name: 'demo task Emphasis',
    author_id: 1,
    subject_id: 5,
    body: '
Emphasis, aka italics, with *asterisks* or _underscores_.

Strong emphasis, aka bold, with **asterisks** or __underscores__.

Combined emphasis with **asterisks and _underscores_**.

Strikethrough uses two tildes. ~~Scratch this.~~',
    duration: 12,
    completed: true
})



Task.create({
    name: 'demo task Lists',
    author_id: 1,
    subject_id: 6,
    body: "
1. First ordered list item
2. Another item
⋅⋅* Unordered sub-list. 
1. Actual numbers don't matter, just that it's a number
⋅⋅1. Ordered sub-list
4. And another item.

⋅⋅⋅You can have properly indented paragraphs within list items. Notice the blank line above, and the leading spaces (at least one, but we'll use three here to also align the raw Markdown).

⋅⋅⋅To have a line break without a paragraph, you will need to use two trailing spaces.⋅⋅
⋅⋅⋅Note that this line is separate, but within the same paragraph.⋅⋅
⋅⋅⋅(This is contrary to the typical GFM line break behaviour, where trailing spaces are not required.)

* Unordered list can use asterisks
- Or minuses
+ Or pluses",
    duration: 700,
    completed: true
})




Task.create({
    name: 'demo task Links',
    author_id: 1,
    subject_id: 6,
    body: "
[I'm an inline-style link](https://www.google.com)

[I'm an inline-style link with title](https://www.google.com 'Google's Homepage')

[I'm a reference-style link][Arbitrary case-insensitive reference text]

[I'm a relative reference to a repository file](../blob/master/LICENSE)

[You can use numbers for reference-style link definitions][1]

Or leave it empty and use the [link text itself].

URLs and URLs in angle brackets will automatically get turned into links. 
http://www.example.com or <http://www.example.com> and sometimes 
example.com (but not on Github, for example).

Some text to show that the reference links can follow later.

[arbitrary case-insensitive reference text]: https://www.mozilla.org
[1]: http://slashdot.org
[link text itself]: http://www.reddit.com ",
    duration: 700,
    completed: true
})


Task.create({
    name: 'demo task Images',
    author_id: 1,
    subject_id: 6,
    body: "
Here's our logo (hover to see the title text):

Inline-style: 
![alt text](https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png 'Logo Title Text 1')

Reference-style: 
![alt text][logo]

[logo]: https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png 'Logo Title Text 2' ",
    duration: 700,
    completed: true
})



Task.create({
    name: 'demo task Code and Syntax Highlighting',
    author_id: 1,
    subject_id: 6,
    body: '
```javascript
var s = "JavaScript syntax highlighting";
alert(s);
```
 
```python
s = "Python syntax highlighting"
print s
```
```ruby
s = "ruby syntax highlighting"
print s
```
 
```
No language indicated, so no syntax highlighting. 
But let"s throw in a <b>tag</b>.
``` ',
    duration: 700,
    completed: true
})




Task.create({
    name: 'demo task Tables',
    author_id: 1,
    subject_id: 6,
    body: "
Colons can be used to align columns.

| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |

There must be at least 3 dashes separating each header cell.
The outer pipes (|) are optional, and you don't need to make the 
raw Markdown line up prettily. You can also use inline Markdown.

Markdown | Less | Pretty
--- | --- | ---
*Still* | `renders` | **nicely**
1 | 2 | 3",
    duration: 700,
    completed: true
})




Task.create({
    name: 'demo task Blockquotes',
    author_id: 1,
    subject_id: 6,
    body: "
> Blockquotes are very handy in email to emulate reply text.
> This line is part of the same quote.

Quote break.

> This is a very long line that will still be quoted properly when it wraps. Oh boy let's keep writing to make sure this is long enough to actually wrap for everyone. Oh, you can *put* **Markdown** into a blockquote.
    ",
    duration: 700,
    completed: true
})




Task.create({
    name: 'demo task Inline HTML',
    author_id: 1,
    subject_id: 6,
    body: '
<dl>
  <dt>Definition list</dt>
  <dd>Is something people use sometimes.</dd>

  <dt>Markdown in HTML</dt>
  <dd>Does *not* work **very** well. Use HTML <em>tags</em>.</dd>
</dl>',
    duration: 700,
    completed: true
})




Task.create({
    name: 'demo task Horizontal Rule',
    author_id: 1,
    subject_id: 6,
    body: '
Three or more...

---

Hyphens

***

Asterisks

___

Underscores',
    duration: 700,
    completed: true
})




Task.create({
    name: 'demo task Line Breaks
',
    author_id: 1,
    subject_id: 6,
    body: "
Here's a line for us to start with.

This line is separated from the one above by two newlines, so it will be a *separate paragraph*.

This line is also a separate paragraph, but...
This line is only separated by a single newline, so it's a separate line in the *same paragraph*.",
    duration: 700,
    completed: true
})





#// Task.create({name: 'demo task 3', author_id: 1, subject_id: 3, body: "this is task 3  ", duration: 900, completed: true })
#// Task.create({name: 'demo task 4', author_id: 1, subject_id: 4, body: "this is task 4  ", duration: 480, completed: true })
#// Task.create({name: 'demo task 5', author_id: 1, subject_id: 5, body: "this is task 5  ", duration: 12, completed: true })
#// Task.create({name: 'demo task 6', author_id: 1, subject_id: 6, body: "this is task 6  ", duration: 700, completed: true })

User.create ({username: 'demoUser', email: 'demoUser@gmail.com', preferred_name: 'demo', user_role: 'demo', pronunciation: 'demo', password: 'hunter2' }) 
# User.create ({username: 'demoUserAws', email: 'demoUserAws@gmail.com', preferred_name: 'demo', user_role: 'demo', pronunciation: 'demo', password: 'hunter2' }) 

