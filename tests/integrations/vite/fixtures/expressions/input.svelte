<script>
	import { markdown } from 'svelte-md-template';

	const hello = 'world';
</script>

{markdown`
~~~
console.log(\`\${foo}\`);
~~~
`}

{markdown`
~~~
say "${hello}" from variable
~~~
`}

{markdown`
~~~
{static} isn't a expression
~~~
`}

{markdown`
hello: \`${hello}\`
`}


{markdown`
not an expression: \`{static}\`
`}

