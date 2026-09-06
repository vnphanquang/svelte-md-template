<script>
	import { markdown } from 'svelte-md-template';
	const foo = 'bar';
</script>

{markdown`
foo is: ${foo}

~~~
foo is ${foo}
~~~
`}
