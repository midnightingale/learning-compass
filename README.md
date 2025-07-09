# learning compass — written doc

## the problem space
I decided to interview my sister Maddie, who's just finished the 11th grade. I’ve observed her studying with friends and struggling through homework problems in STEM classes, so I wanted to understand the primary difficulties they face in their learning.

It turns out that the primary way that Maddie and her friends interact with LLMs is by pasting a question directly into the chat box. This means that:
- The chat gets no context about the state of her knowledge -> 
  - Chat can’t provide directed help for knowledge gaps
- Exercising agency over the conversation is a lot of work -> 
  - She doesn’t type out more context or ask detailed clarifying questions
- She gets the answer immediately ->
  - She doesn’t develop the problem-solving skills she needs for the test!

In other words, students are often motivated to internalize the content, but the existing tools are annoying to use and don’t help them learn. I’ve seen teachers echo these flaws, writing articles lamenting how AI chatbots dismiss students instead of letting them drive ([Dan Meyer](https://danmeyer.substack.com/p/khanmigo-wants-to-love-kids-but-doesnt)). I wanted to create a problem-solving scaffolding tool for my sister’s generation: it would make relevant content easy to reach, *and* encourage agentic content exploration to fill in knowledge gaps.

## the solution

If our destination is to develop subject knowledge and problem-solving skills, the core idea here is to *make it easier for students to drive*. My solution does this by providing **landmarks** for navigating the problem-solving terrain, and **handles** to make it easier to steer the conversation.

Landmarks:
- **Quantities**: Students struggle with extracting relevant information from word problems. They can check that they did this right with the quantities button.
- **Goal**: Word problems also make students forget what they’re trying to calculate. The goal button summarizes this. 
- **Interactive formulas**: A pain point I heard from Maddie is that it’s hard to navigate school-issued formula sheets, especially if you missed the lesson where the formula was introduced. It’s a lot easier to reason about the formulas when they tell you what the variables represent.

Handles:
- **Highlighted keywords**: In formulas and the chat, clicking these opens a concept card. Concept cards succinctly explain a concept and its relevance to the problem. This gives students the agency to fill in knowledge gaps and their dependencies, as well as letting them rabbithole in whichever direction they want!

## the design
My design philosophy is that without a user, I’ve got no one to build for. I hopped into FigJam to discuss mockups with Maddie, and then whipped up designs in Figma. I incorporated feedback from Maddie and other learners of all ages repeatedly throughout the process.
![](Landing.png)
![](Mockup_%20concept%20card-1.png)
![](Mockup_%20formulas.png)

## learning principles
1. Students practice **active construction** to build their understanding, with the aid of the interactive formulas and concept cards.
2. The quantities and goal buttons help students introspect on their own problem-solving process and identify where they might be stuck. By exercising agency about which parts of the scaffolding to reveal, students practice **metacognitive awareness**.
3. I’m a fan of Vygotsky’s **zone of proximal development**, where support at the edge of your abilities gets you into a learning flow state. The intention with Learning Compass is that there’s just enough scaffolding to support you getting there, but we don’t reveal all the pieces of the puzzle right away. For example, learners may want to figure out which formulas are relevant on their own before checking with the tool.


## measuring success
Since this tool aims to fill in knowledge gaps and build competence in problem-solving, these objectives should both be measured before and after using it. 
- We can measure meta problem-solving skills by measuring the time spent identifying missing information, and the time spent in different problem phases.
- To test knowledge transfer, we can measure the time spent and correctness achieved on similar problems after students use the tool.
- We can survey student confidence in solving these types of problems, comparing this with their actual success rate to observe their level of metacognitive awareness.

Additionally, we should observe qualitatively whether students are using the scaffolding in a way that truly enhances their agency, or whether the tool provides too many distracting and permissive affordances. 
- Do students try parts of the problem on their own before revealing quantities and formulas, or do they just reveal it all right away? Does this change if we add a delay before information is shown?
- Are students exploring dependencies through concept cards, or rabbitholing so deep that they forget about the problem?


—
made with ♡ by sophie
