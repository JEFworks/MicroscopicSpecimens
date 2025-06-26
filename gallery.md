---
layout: default
---

<h1>Slide Gallery</h1>
<div class="gallery-grid">
  {% for slide in site.slides %}
    <h2>{{ slide.title }}</h2>
    <a href="{{ slide.url }}" class="gallery-item">
      <img src="{{ slide.image }}" alt="{{ slide.alt | default: slide.title }}">
      <p>{{ slide.title }}</p>
    </a>
  {% endfor %}
</div>