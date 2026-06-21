<template>
  <main
    class="flex min-h-dvh items-center justify-center bg-bg-light px-4 font-academic text-text-gray"
  >
    <section class="academic-card w-full max-w-md rounded-lg p-6">
      <p class="mb-2 font-mono text-xs text-text-gray-light">404</p>
      <h1 class="text-xl font-semibold tracking-tight">Page not found</h1>
      <p class="mt-2 text-sm leading-relaxed text-text-gray-light">
        The page you opened does not exist.
      </p>
      <div class="mt-5 flex flex-wrap gap-2">
        <RouterLink
          to="/"
          class="rounded-full bg-primary-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-blue-dark"
        >
          Home
        </RouterLink>
        <RouterLink
          to="/world"
          class="rounded-full bg-bg-secondary px-4 py-2 text-sm font-medium text-text-gray transition-colors hover:bg-slate-200"
        >
          Workstation at BUAA
        </RouterLink>
      </div>
    </section>
  </main>
</template>
