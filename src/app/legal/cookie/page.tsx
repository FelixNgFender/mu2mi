import type { Metadata } from "next";
import { siteConfig } from "@/config";

export const metadata: Metadata = {
  title: "Cookie Policy",
};

export default function CookiesPage() {
  return (
    <section className="container relative flex h-full flex-1 flex-col gap-4 py-8">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Cookie Policy
      </h1>

      <p className="leading-7 not-first:mt-6">
        This is the Cookie Policy for Mu2Mi, accessible from {siteConfig.url}
      </p>

      <p className="leading-7 not-first:mt-6">What Are Cookies</p>

      <p className="leading-7 not-first:mt-6">
        As is common practice with almost all professional websites this site
        uses cookies, which are tiny files that are downloaded to your computer,
        to improve your experience. This page describes what information they
        gather, how we use it and why we sometimes need to store these cookies.
        We will also share how you can prevent these cookies from being stored
        however this may downgrade or &apos;break&apos; certain elements of the
        sites functionality.
      </p>

      <p className="leading-7 not-first:mt-6">How We Use Cookies</p>

      <p className="leading-7 not-first:mt-6">
        We use cookies for a variety of reasons detailed below. Unfortunately in
        most cases there are no industry standard options for disabling cookies
        without completely disabling the functionality and features they add to
        this site. It is recommended that you leave on all cookies if you are
        not sure whether you need them or not in case they are used to provide a
        service that you use.
      </p>

      <p className="leading-7 not-first:mt-6">Disabling Cookies</p>

      <p className="leading-7 not-first:mt-6">
        You can prevent the setting of cookies by adjusting the settings on your
        browser (see your browser Help for how to do this). Be aware that
        disabling cookies will affect the functionality of this and many other
        websites that you visit. Disabling cookies will usually result in also
        disabling certain functionality and features of the this site. Therefore
        it is recommended that you do not disable cookies.
      </p>
      <p className="leading-7 not-first:mt-6">The Cookies We Set</p>

      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>
          <p className="leading-7 not-first:mt-6">Account related cookies</p>
          <p className="leading-7 not-first:mt-6">
            If you create an account with us then we will use cookies for the
            management of the signup process and general administration. These
            cookies will usually be deleted when you log out however in some
            cases they may remain afterwards to remember your site preferences
            when logged out.
          </p>
        </li>

        <li>
          <p className="leading-7 not-first:mt-6">Login related cookies</p>
          <p className="leading-7 not-first:mt-6">
            We use cookies when you are logged in so that we can remember this
            fact. This prevents you from having to log in every single time you
            visit a new page. These cookies are typically removed or cleared
            when you log out to ensure that you can only access restricted
            features and areas when logged in.
          </p>
        </li>
      </ul>

      <p className="leading-7 not-first:mt-6">Third Party Cookies</p>

      <p className="leading-7 not-first:mt-6">
        In some special cases we also use cookies provided by trusted third
        parties. The following section details which third party cookies you
        might encounter through this site.
      </p>

      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>
          <p className="leading-7 not-first:mt-6">
            From time to time we test new features and make subtle changes to
            the way that the site is delivered. When we are still testing new
            features these cookies may be used to ensure that you receive a
            consistent experience whilst on the site whilst ensuring we
            understand which optimisations our users appreciate the most.
          </p>
        </li>
      </ul>

      <p className="leading-7 not-first:mt-6">More Information</p>

      <p className="leading-7 not-first:mt-6">
        Hopefully that has clarified things for you and as was previously
        mentioned if there is something that you aren&apos;t sure whether you
        need or not it&apos;s usually safer to leave cookies enabled in case it
        does interact with one of the features you use on our site.
      </p>

      <p className="leading-7 not-first:mt-6">
        For more general information on cookies, please read{" "}
        <a href="https://www.cookiepolicygenerator.com/sample-cookies-policy/">
          the Cookies Policy article
        </a>
        .
      </p>

      <p className="leading-7 not-first:mt-6">
        However if you are still looking for more information then you can
        contact us through one of our preferred contact methods:
      </p>

      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>Email: {siteConfig.contact}</li>
      </ul>
    </section>
  );
}
