import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Facebook, X, Instagram, Youtube, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h3 className="font-semibold text-lg mb-4">About Cooking Circle</h3>
            <p className="text-sm text-gray-600 mb-4">
              Join our community of food enthusiasts sharing recipes, cooking tips, and culinary adventures.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                <X className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/recipes" className="text-gray-600 hover:text-black transition-colors">
                  Browse Recipes
                </Link>
              </li>
              <li>
                <Link href="/meal-planner" className="text-gray-600 hover:text-black transition-colors">
                  Meal Planner
                </Link>
              </li>
              <li>
                <Link href="/cooking-tips" className="text-gray-600 hover:text-black transition-colors">
                  Cooking Tips
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-gray-600 hover:text-black transition-colors">
                  Shop Kitchen Essentials
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-black transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-gray-600 hover:text-black transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-gray-600 hover:text-black transition-colors">
                  Community Guidelines
                </Link>
              </li>
              <li>
                <Link href="/safety" className="text-gray-600 hover:text-black transition-colors">
                  Safety Tips
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-black transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-black transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Stay Updated</h3>
            <p className="text-sm text-gray-600 mb-4">
              Subscribe to our newsletter for recipes, cooking tips, and special offers.
            </p>
            <form className="space-y-2">
              <Input type="email" placeholder="Enter your email" className="w-full" />
              <Button type="submit" className="w-full">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="text-sm text-gray-600">
              <p>Download our mobile app:</p>
              <div className="flex gap-4 mt-2">
                <Link href="#" className="hover:opacity-80 transition-opacity">
                  <img src="/placeholder.svg?height=40&width=120" alt="Download on the App Store" className="h-10" />
                </Link>
                <Link href="#" className="hover:opacity-80 transition-opacity">
                  <img src="/placeholder.svg?height=40&width=120" alt="Get it on Google Play" className="h-10" />
                </Link>
              </div>
            </div>
            <div className="text-sm text-gray-600 md:text-right">
              <p>Payment methods accepted:</p>
              <div className="flex gap-2 mt-2 md:justify-end">
                <img src="/placeholder.svg?height=30&width=40" alt="Visa" className="h-8" />
                <img src="/placeholder.svg?height=30&width=40" alt="Mastercard" className="h-8" />
                <img src="/placeholder.svg?height=30&width=40" alt="American Express" className="h-8" />
                <img src="/placeholder.svg?height=30&width=40" alt="PayPal" className="h-8" />
              </div>
            </div>
          </div>

          {/* Legal Links */}
          <div className="border-t pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                © {new Date().getFullYear()} Cooking Circle. All rights reserved.
              </div>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Link href="/terms" className="text-gray-600 hover:text-black transition-colors">
                  Terms of Service
                </Link>
                <Link href="/privacy" className="text-gray-600 hover:text-black transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/cookies" className="text-gray-600 hover:text-black transition-colors">
                  Cookie Policy
                </Link>
                <Link href="/accessibility" className="text-gray-600 hover:text-black transition-colors">
                  Accessibility
                </Link>
                <Link href="/sitemap" className="text-gray-600 hover:text-black transition-colors">
                  Sitemap
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

