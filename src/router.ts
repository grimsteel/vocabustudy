import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'; // we import this here to make sure it loads instantly without having to wait for a network request
import { useAuthStore, usePreferencesStore } from './store';

declare module "vue-router" {
    interface RouteMeta {
        title: string | false | undefined; // If title is `false`, this page has no unique title. If it's undefined, don't change the previous title
        requiresAuth?: boolean;
    }
}

export default function () {
    const router = createRouter({
        history: createWebHistory(import.meta.env.BASE_URL),
        routes: [
            {
                path: '/',
                name: 'home',
                component: HomeView,
                meta: {
                    title: false
                }
            },
            {
                path: '/credits/',
                name: 'credits',
                component: () => import('./views/CreditsView.vue'),
                meta: {
                    title: "Credits"
                }
            },
            {
                path: '/saved/',
                name: 'saved-sets',
                component: () => import('./views/SavedSetsView.vue'),
                meta: {
                    title: "Saved Sets"
                }
            },
            {
                path: '/help-center/',
                name: 'help-center',
                component: () => import('./views/HelpCenterView.vue'),
                meta: {
                    title: "Help Center"
                }
            },
            {
                path: '/social/',
                name: 'social',
                component: () => import('./views/SocialView.vue'),
                meta: {
                    title: "Social"
                }
            },
            {
                path: '/forms/',
                name: 'forms',
                component: () => import('./views/FormsView.vue'),
                meta: {
                    title: "Contact Us"
                }
            },
            {
                path: '/support-us/',
                name: 'support-us',
                component: () => import('./views/SupportUsView.vue'),
                meta: {
                    title: "Support Us"
                }
            },
            {
                path: '/privacy/',
                name: 'privacy',
                component: () => import('./views/PrivacyPolicyView.vue'),
                meta: {
                    title: "Privacy Policy"
                }
            },
            {
                path: '/terms/',
                name: 'terms',
                component: () => import('./views/TOSView.vue'),
                meta: {
                    title: "Terms of Service"
                }
            },
            {
                path: '/search/',
                name: 'search',
                component: () => import('./views/SearchView.vue'),
                meta: {
                    title: "Search"
                }
            },
            {
                path: '/login/',
                name: 'login',
                component: () => import('./views/LoginView.vue'),
                meta: {
                    title: "Log in"
                }
            },
            {
                path: '/signup/',
                redirect: { name: "login" }
            },
            {
                path: '/account/',
                name: 'account',
                component: () => import('./views/AccountView.vue'),
                meta: {
                    title: "Account",
                    requiresAuth: true
                }
            },
            {
                path: '/my-sets/',
                name: 'my-sets',
                component: () => import('./views/MySetsView.vue'),
                meta: {
                    title: "My Sets",
                    requiresAuth: true
                }
            },
            {
                path: '/auth-action/',
                name: 'auth-action',
                component: () => import('./views/AuthActionView.vue'),
                meta: {
                    title: "Reset Password / Verify Email"
                }
            },
            {
                path: '/:pathMatch(.*)*',
                name: 'not-found',
                component: () => import('./views/NotFoundView.vue'),
                meta: {
                    title: "404 - Not Found"
                }
            },
            {
                path: '/:type(set|quizlet)/:id([\\w\\d]+)/',
                component: () => import('./views/SetViewerView.vue'),
                children: [
                    {
                        path: '',
                        component: () => import('./views/set-viewer/SetOverviewView.vue'),
                        name: "set-detail"
                    },
                    {
                        path: 'view/',
                        redirect: { name: "set-detail" }
                    },
                    {
                        path: 'flashcards/',
                        component: () => import('./views/set-viewer/FlashcardsView.vue'),
                        name: "flashcards"
                    },
                    {
                        path: 'learn/',
                        component: () => import('./views/set-viewer/LearnView.vue'),
                        name: "learn"
                    },
                    {
                        path: 'test/',
                        component: () => import('./views/set-viewer/TestView.vue'),
                        name: "test"
                    },
                    {
                        path: 'match/',
                        component: () => import('./views/set-viewer/MatchView.vue'),
                        name: "match"
                    }
                ]
            },
            {
                path: '/:type(set|quizlet)/:id([\\w\\d-]+)/edit/',
                name: 'set-editor',
                component: () => import('./views/SetEditorView.vue'),
                meta: {
                    title: "Edit Set",
                    requiresAuth: true
                },
                alias: '/:type(set)/:id(new|new-guide)/'
            },
            {
                path: '/collection/:id/',
                name: 'collection-detail',
                component: () => import('./views/NotFoundView.vue'),
                meta: {
                    title: "Collection Detail"
                }
            }
        ]
    });

    const authStore = useAuthStore();
    const preferencesStore = usePreferencesStore();

    router.beforeEach(async (to, from) => {
        // Show the loading title if we're not navigating between two non name changing pages
        if (!(to.meta.name === undefined && from.meta.name === undefined))
            document.title = "Loading... - Vocabustudy"

        preferencesStore.startNavigation();

        if (to.meta.requiresAuth) {
            await authStore.refreshCurrentUser();
            if (!authStore.currentUser) {
                return {
                    path: "/login",
                    query: { next: to.fullPath },
                }
            }
        }
    });

    router.afterEach((to) => {
        preferencesStore.stopNavigation();
        if (to.meta.title !== undefined)
            document.title = to.meta.title !== false ? `${to.meta.title} - Vocabustudy` : `Vocabustudy`;
        document.querySelector("link[rel='canonical']")?.setAttribute("href", new URL(to.path, "https://vocabustudy.org").toString());
    });

    return router;
}
