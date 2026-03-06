import {
  type PromoBanner,
  loadPromoBanners,
  savePromoBanners,
} from "@/components/PromoBanners";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import {
  useAllOrders,
  useCategories,
  useCoupons,
  useCreateCategory,
  useCreateCoupon,
  useCreateGiftCard,
  useCreateProduct,
  useDeleteCategory,
  useDeleteProduct,
  useIsActorReady,
  usePaymentInfo,
  useProducts,
  useSetPaymentInfo,
  useToggleCoupon,
  useUpdateCategory,
  useUpdateOrderStatus,
  useUpdateProduct,
  useVerifyStaffCode,
} from "@/hooks/useQueries";
import {
  ArrowDownToLine,
  Check,
  CreditCard,
  Eye,
  EyeOff,
  Gift,
  Grid3X3,
  Loader2,
  Lock,
  Megaphone,
  Package,
  Pencil,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  TrendingUp,
  Truck,
  Wallet,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Coupon, Product } from "../backend.d";
import {
  CARRIER_OPTIONS,
  getTrackingStore,
  setOrderTracking,
} from "../utils/trackingStore";

const STAFF_SESSION_KEY = "gw_staff_auth";

function formatPrice(pence: bigint): string {
  return `£${(Number(pence) / 100).toFixed(2)}`;
}

function formatDate(ns: bigint): string {
  return new Date(Number(ns) / 1_000_000).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_OPTIONS = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

// ── Staff Login ────────────────────────────────────────────────────────────────
function StaffLogin({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [code, setCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [step, setStep] = useState<"login" | "code">("login");
  const verify = useVerifyStaffCode();
  const actorReady = useIsActorReady();
  const { isLoggedIn, isInitializing, isLoggingIn, login } = useAuth();

  // Once user logs in, move to code step
  useEffect(() => {
    if (isLoggedIn) {
      setStep("code");
    }
  }, [isLoggedIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    if (!actorReady) {
      toast.error("Still connecting — please wait a moment and try again");
      return;
    }
    try {
      const ok = await verify.mutateAsync(code);
      if (ok) {
        sessionStorage.setItem(STAFF_SESSION_KEY, "true");
        onSuccess();
      } else {
        toast.error("Invalid staff code");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      toast.error(
        msg.includes("Not ready")
          ? "Still connecting to the network — please wait a moment and try again"
          : "Verification failed — please try again",
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary mb-4">
            <Lock className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold">Staff Panel</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {step === "login"
              ? "Sign in with Internet Identity to continue"
              : "Enter your staff code to unlock the panel"}
          </p>
        </div>

        {step === "login" ? (
          <div className="crystal-card rounded-2xl p-8 space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Staff must sign in before entering their access code.
            </p>
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 gap-2"
              onClick={login}
              disabled={isInitializing || isLoggingIn}
              data-ocid="staff.ii_login.button"
            >
              {isInitializing || isLoggingIn ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isInitializing ? "Loading…" : "Opening login…"}
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Sign in with Internet Identity
                </>
              )}
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="crystal-card rounded-2xl p-8 space-y-4"
          >
            <div>
              <Label htmlFor="staff-code">Staff Code</Label>
              <div className="relative mt-1">
                <Input
                  id="staff-code"
                  type={showCode ? "text" : "password"}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter staff code"
                  className="pr-10"
                  data-ocid="staff.code.input"
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCode((v) => !v)}
                  data-ocid="staff.code.toggle"
                >
                  {showCode ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11"
              disabled={verify.isPending || !code || !actorReady}
              data-ocid="staff.login.button"
            >
              {!actorReady ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Connecting…
                </>
              ) : verify.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Verifying…
                </>
              ) : (
                "Access Staff Panel"
              )}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

// ── Products Tab ───────────────────────────────────────────────────────────────
function ProductsTab() {
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const emptyForm = {
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    imageUrl: "",
    active: true,
  };
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<bigint | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const openEdit = (product: Product) => {
    setEditId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: (Number(product.price) / 100).toString(),
      stock: product.stock.toString(),
      categoryId: product.categoryId.toString(),
      imageUrl: product.imageUrl,
      active: product.active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.stock) {
      toast.error("Please fill in required fields");
      return;
    }
    const productData: Product = {
      id: editId ?? BigInt(0),
      name: form.name,
      description: form.description,
      price: BigInt(Math.round(Number.parseFloat(form.price) * 100)),
      stock: BigInt(Number.parseInt(form.stock) || 0),
      categoryId: form.categoryId ? BigInt(form.categoryId) : BigInt(0),
      imageUrl: form.imageUrl,
      active: form.active,
    };
    try {
      if (editId !== null) {
        await updateProduct.mutateAsync({ id: editId, product: productData });
        toast.success("Product updated");
      } else {
        await createProduct.mutateAsync(productData);
        toast.success("Product created");
      }
      setForm(emptyForm);
      setEditId(null);
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save product");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteProduct.mutateAsync(id);
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-lg">Products</h2>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setForm(emptyForm);
              setEditId(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-9"
              data-ocid="staff.product.open_modal_button"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" data-ocid="staff.product.dialog">
            <DialogHeader>
              <DialogTitle>
                {editId !== null ? "Edit Product" : "New Product"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2">
                <Label>Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Product name"
                  className="mt-1"
                  data-ocid="staff.product.name.input"
                />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Product description"
                  className="mt-1"
                  rows={2}
                  data-ocid="staff.product.description.textarea"
                />
              </div>
              <div>
                <Label>Price (£) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  placeholder="9.99"
                  className="mt-1"
                  data-ocid="staff.product.price.input"
                />
              </div>
              <div>
                <Label>Stock *</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, stock: e.target.value }))
                  }
                  placeholder="100"
                  className="mt-1"
                  data-ocid="staff.product.stock.input"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, categoryId: v }))
                  }
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="staff.product.category.select"
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem
                        key={cat.id.toString()}
                        value={cat.id.toString()}
                      >
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Active</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Switch
                    checked={form.active}
                    onCheckedChange={(v) =>
                      setForm((f) => ({ ...f, active: v }))
                    }
                    data-ocid="staff.product.active.switch"
                  />
                  <span className="text-sm text-muted-foreground">
                    {form.active ? "Listed" : "Hidden"}
                  </span>
                </div>
              </div>
              <div className="col-span-2">
                <Label>Image URL</Label>
                <Input
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, imageUrl: e.target.value }))
                  }
                  placeholder="https://…"
                  className="mt-1"
                  data-ocid="staff.product.image.input"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                data-ocid="staff.product.cancel.button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createProduct.isPending || updateProduct.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-ocid="staff.product.save.button"
              >
                {createProduct.isPending || updateProduct.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save Product"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-2" data-ocid="staff.product.loading_state">
          {Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
            <Skeleton key={i} className="h-12 rounded" />
          ))}
        </div>
      ) : !products || products.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="staff.product.empty_state"
        >
          <Package className="h-8 w-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No products yet. Add your first product!</p>
        </div>
      ) : (
        <div
          className="rounded-lg border border-border overflow-hidden"
          data-ocid="staff.product.table"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product, i) => (
                <TableRow
                  key={product.id.toString()}
                  data-ocid={`staff.product.row.${i + 1}`}
                >
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell>{Number(product.stock)}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        product.active
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      }
                    >
                      {product.active ? "Active" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(product)}
                        data-ocid={`staff.product.edit.button.${i + 1}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-destructive"
                            data-ocid={`staff.product.delete.button.${i + 1}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent data-ocid="staff.product.delete.dialog">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{product.name}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-ocid="staff.product.delete.cancel.button">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(product.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              data-ocid="staff.product.delete.confirm.button"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ── Categories Tab ─────────────────────────────────────────────────────────────
function CategoriesTab() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<bigint | null>(null);
  const [editName, setEditName] = useState("");

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createCategory.mutateAsync(newName.trim());
      setNewName("");
      toast.success("Category created");
    } catch {
      toast.error("Failed to create category");
    }
  };

  const handleUpdate = async (id: bigint) => {
    if (!editName.trim()) return;
    try {
      await updateCategory.mutateAsync({ id, name: editName.trim() });
      setEditId(null);
      toast.success("Category updated");
    } catch {
      toast.error("Failed to update category");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteCategory.mutateAsync(id);
      toast.success("Category deleted");
    } catch {
      toast.error("Failed to delete category");
    }
  };

  return (
    <div>
      <h2 className="font-display font-bold text-lg mb-4">Categories</h2>

      {/* Add new */}
      <div className="flex gap-3 mb-6">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="New category name"
          className="max-w-xs"
          data-ocid="staff.category.name.input"
        />
        <Button
          onClick={handleCreate}
          disabled={createCategory.isPending || !newName.trim()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          data-ocid="staff.category.add.button"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2" data-ocid="staff.category.loading_state">
          {Array.from({ length: 3 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
            <Skeleton key={i} className="h-12 rounded" />
          ))}
        </div>
      ) : !categories || categories.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="staff.category.empty_state"
        >
          <Grid3X3 className="h-8 w-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No categories yet.</p>
        </div>
      ) : (
        <div className="space-y-2" data-ocid="staff.category.list">
          {categories.map((cat, i) => (
            <div
              key={cat.id.toString()}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
              data-ocid={`staff.category.item.${i + 1}`}
            >
              {editId === cat.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleUpdate(cat.id)}
                    className="h-8 max-w-xs"
                    autoFocus
                    data-ocid={`staff.category.edit.input.${i + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-green-600"
                    onClick={() => handleUpdate(cat.id)}
                    data-ocid={`staff.category.save.button.${i + 1}`}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setEditId(null)}
                    data-ocid={`staff.category.cancel.button.${i + 1}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <span className="font-medium text-sm">{cat.name}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditId(cat.id);
                        setEditName(cat.name);
                      }}
                      data-ocid={`staff.category.edit.button.${i + 1}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-destructive"
                          data-ocid={`staff.category.delete.button.${i + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent data-ocid="staff.category.delete.dialog">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Delete "{cat.name}"? Products in this category won't
                            be automatically updated.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel data-ocid="staff.category.delete.cancel.button">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(cat.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            data-ocid="staff.category.delete.confirm.button"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Coupons Tab ────────────────────────────────────────────────────────────────
function CouponsTab() {
  const { data: coupons, isLoading } = useCoupons();
  const createCoupon = useCreateCoupon();
  const toggleCoupon = useToggleCoupon();

  const [form, setForm] = useState({
    code: "",
    discountType: "percent",
    value: "",
    active: true,
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreate = async () => {
    if (!form.code.trim() || !form.value) return;
    const coupon: Coupon = {
      id: BigInt(0),
      code: form.code.trim().toUpperCase(),
      discountType: form.discountType,
      value:
        form.discountType === "percent"
          ? BigInt(Number.parseInt(form.value))
          : BigInt(Math.round(Number.parseFloat(form.value) * 100)),
      active: form.active,
    };
    try {
      await createCoupon.mutateAsync(coupon);
      toast.success("Coupon created");
      setForm({ code: "", discountType: "percent", value: "", active: true });
      setDialogOpen(false);
    } catch {
      toast.error("Failed to create coupon");
    }
  };

  const handleToggle = async (id: bigint, active: boolean) => {
    try {
      await toggleCoupon.mutateAsync({ id, active: !active });
      toast.success(`Coupon ${!active ? "activated" : "deactivated"}`);
    } catch {
      toast.error("Failed to update coupon");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-lg">Coupons</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-9"
              data-ocid="staff.coupon.open_modal_button"
            >
              <Plus className="h-4 w-4" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="staff.coupon.dialog">
            <DialogHeader>
              <DialogTitle>Create Coupon</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <Label>Code *</Label>
                <Input
                  value={form.code}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="GARDEN20"
                  className="mt-1 font-mono"
                  data-ocid="staff.coupon.code.input"
                />
              </div>
              <div>
                <Label>Discount Type</Label>
                <Select
                  value={form.discountType}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, discountType: v, value: "" }))
                  }
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="staff.coupon.type.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>
                  Value ({form.discountType === "percent" ? "%" : "£"}) *
                </Label>
                <Input
                  type="number"
                  min="0"
                  max={form.discountType === "percent" ? "100" : undefined}
                  step={form.discountType === "percent" ? "1" : "0.01"}
                  value={form.value}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, value: e.target.value }))
                  }
                  placeholder={form.discountType === "percent" ? "20" : "5.00"}
                  className="mt-1"
                  data-ocid="staff.coupon.value.input"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.active}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))}
                  data-ocid="staff.coupon.active.switch"
                />
                <Label>{form.active ? "Active" : "Inactive"}</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                data-ocid="staff.coupon.cancel.button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createCoupon.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-ocid="staff.coupon.save.button"
              >
                {createCoupon.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create Coupon"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-2" data-ocid="staff.coupon.loading_state">
          {Array.from({ length: 3 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
            <Skeleton key={i} className="h-12 rounded" />
          ))}
        </div>
      ) : !coupons || coupons.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="staff.coupon.empty_state"
        >
          <Tag className="h-8 w-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No coupons yet.</p>
        </div>
      ) : (
        <div
          className="rounded-lg border border-border overflow-hidden"
          data-ocid="staff.coupon.table"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Toggle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon, i) => (
                <TableRow
                  key={coupon.id.toString()}
                  data-ocid={`staff.coupon.row.${i + 1}`}
                >
                  <TableCell className="font-mono font-semibold">
                    {coupon.code}
                  </TableCell>
                  <TableCell className="capitalize">
                    {coupon.discountType}
                  </TableCell>
                  <TableCell>
                    {coupon.discountType === "percent"
                      ? `${coupon.value}%`
                      : formatPrice(coupon.value)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        coupon.active
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      }
                    >
                      {coupon.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch
                      checked={coupon.active}
                      onCheckedChange={() =>
                        handleToggle(coupon.id, coupon.active)
                      }
                      data-ocid={`staff.coupon.toggle.${i + 1}`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ── Payment Tab ────────────────────────────────────────────────────────────────
function PaymentTab() {
  const { data: paymentInfo } = usePaymentInfo();
  const setPaymentInfo = useSetPaymentInfo();

  const [method, setMethod] = useState("PayPal");
  const [details, setDetails] = useState(
    "Please send payment to payments@gardeningworld.com via PayPal. Include your order number as the reference.",
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (paymentInfo && paymentInfo.length > 0) {
      setMethod(paymentInfo[0].method);
      setDetails(paymentInfo[0].details);
    }
  }, [paymentInfo]);

  const handleSave = async () => {
    try {
      await setPaymentInfo.mutateAsync({ method, details });
      setSaved(true);
      toast.success("Payment info updated");
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error("Failed to update payment info");
    }
  };

  return (
    <div>
      <h2 className="font-display font-bold text-lg mb-4">Payment Info</h2>
      <div className="crystal-card rounded-xl p-6 max-w-lg space-y-4">
        <div>
          <Label>Payment Method</Label>
          <Input
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            placeholder="e.g. PayPal"
            className="mt-1"
            data-ocid="staff.payment.method.input"
          />
        </div>
        <div>
          <Label>Details / Instructions</Label>
          <Textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Payment instructions for customers…"
            className="mt-1"
            rows={4}
            data-ocid="staff.payment.details.textarea"
          />
        </div>
        <Button
          onClick={handleSave}
          disabled={setPaymentInfo.isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          data-ocid="staff.payment.save.button"
        >
          {setPaymentInfo.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <>
              <Check className="h-4 w-4 text-green-400" />
              Saved!
            </>
          ) : (
            "Save Payment Info"
          )}
        </Button>

        {/* Current config */}
        {paymentInfo && paymentInfo.length > 0 && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-widest">
              Current Configuration
            </p>
            {paymentInfo.map((info, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: payment info items have no stable id
              <div key={i} className="p-3 rounded-lg bg-secondary text-sm">
                <p className="font-semibold">{info.method}</p>
                <p className="text-muted-foreground">{info.details}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Orders Tab ─────────────────────────────────────────────────────────────────
function OrdersTab() {
  const { data: orders, isLoading } = useAllOrders();
  const updateStatus = useUpdateOrderStatus();

  // Tracking state — refreshes after each save so table re-renders
  const [trackingStore, setTrackingStoreState] = useState<
    Record<string, { trackingNumber: string; carrier: string }>
  >(() => getTrackingStore());

  // Tracking dialog state
  const [trackingDialogOrderId, setTrackingDialogOrderId] = useState<
    string | null
  >(null);
  const [trackingCarrier, setTrackingCarrier] = useState("Royal Mail");
  const [trackingNumber, setTrackingNumber] = useState("");

  const openTrackingDialog = (orderId: string) => {
    const existing = trackingStore[orderId];
    setTrackingCarrier(existing?.carrier ?? "Royal Mail");
    setTrackingNumber(existing?.trackingNumber ?? "");
    setTrackingDialogOrderId(orderId);
  };

  const handleSaveTracking = () => {
    if (!trackingDialogOrderId) return;
    if (!trackingNumber.trim()) {
      toast.error("Please enter a tracking number");
      return;
    }
    setOrderTracking(
      trackingDialogOrderId,
      trackingNumber.trim(),
      trackingCarrier,
    );
    setTrackingStoreState(getTrackingStore());
    toast.success("Tracking added");
    setTrackingDialogOrderId(null);
    setTrackingNumber("");
    setTrackingCarrier("Royal Mail");
  };

  const handleStatusChange = async (id: bigint, status: string) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success("Order status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div>
      <h2 className="font-display font-bold text-lg mb-4">All Orders</h2>

      {/* Tracking Dialog */}
      <Dialog
        open={trackingDialogOrderId !== null}
        onOpenChange={(open) => {
          if (!open) setTrackingDialogOrderId(null);
        }}
      >
        <DialogContent data-ocid="staff.order.tracking.dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Set Tracking — Order #{trackingDialogOrderId}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Carrier</Label>
              <Select
                value={trackingCarrier}
                onValueChange={setTrackingCarrier}
              >
                <SelectTrigger
                  className="mt-1"
                  data-ocid="staff.order.tracking.carrier.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CARRIER_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tracking Number</Label>
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. AB123456789GB"
                className="mt-1 font-mono"
                data-ocid="staff.order.tracking.number.input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTrackingDialogOrderId(null)}
              data-ocid="staff.order.tracking.cancel.button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTracking}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              data-ocid="staff.order.tracking.save.button"
            >
              <Truck className="h-4 w-4" />
              Save Tracking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="space-y-2" data-ocid="staff.orders.loading_state">
          {Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
            <Skeleton key={i} className="h-12 rounded" />
          ))}
        </div>
      ) : !orders || orders.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="staff.orders.empty_state"
        >
          <ShoppingBag className="h-8 w-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No orders yet.</p>
        </div>
      ) : (
        <div
          className="rounded-lg border border-border overflow-x-auto"
          data-ocid="staff.orders.table"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Tracking</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order, i) => {
                const tracking = trackingStore[order.id.toString()];
                return (
                  <TableRow
                    key={order.id.toString()}
                    data-ocid={`staff.order.row.${i + 1}`}
                  >
                    <TableCell className="font-mono text-xs">
                      #{order.id.toString()}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatPrice(order.total)}
                    </TableCell>
                    <TableCell>
                      {tracking ? (
                        <div className="space-y-0.5">
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs gap-1">
                            <Truck className="h-3 w-3" />
                            {tracking.carrier}
                          </Badge>
                          <p className="font-mono text-xs text-muted-foreground">
                            {tracking.trackingNumber}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/50 italic">
                          None
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(v) => handleStatusChange(order.id, v)}
                      >
                        <SelectTrigger
                          className="h-8 text-xs w-36"
                          data-ocid={`staff.order.status.select.${i + 1}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem
                              key={s}
                              value={s}
                              className="capitalize text-xs"
                            >
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-primary"
                        title="Set tracking"
                        onClick={() => openTrackingDialog(order.id.toString())}
                        data-ocid={`staff.order.tracking.button.${i + 1}`}
                      >
                        <Truck className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ── Gift Cards Tab ─────────────────────────────────────────────────────────────
function GiftCardsTab() {
  const createGiftCard = useCreateGiftCard();
  const [form, setForm] = useState({ code: "", balance: "" });
  const [issued, setIssued] = useState<
    Array<{ code: string; balance: string }>
  >(() => {
    try {
      const stored = localStorage.getItem("gw_issued_gift_cards");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const segment = () =>
      Array.from(
        { length: 4 },
        () => chars[Math.floor(Math.random() * chars.length)],
      ).join("");
    return `GW-${segment()}-${segment()}`;
  };

  const handleCreate = async () => {
    if (!form.balance) return;
    const code = form.code.trim().toUpperCase() || generateCode();
    const balance = BigInt(Math.round(Number.parseFloat(form.balance) * 100));
    try {
      await createGiftCard.mutateAsync({ code, balance });
      const newEntry = {
        code,
        balance: `£${Number.parseFloat(form.balance).toFixed(2)}`,
      };
      const updated = [newEntry, ...issued];
      setIssued(updated);
      localStorage.setItem("gw_issued_gift_cards", JSON.stringify(updated));
      toast.success(`Gift card ${code} created`);
      setForm({ code: "", balance: "" });
      setDialogOpen(false);
    } catch {
      toast.error("Failed to create gift card");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-lg">Gift Cards</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-9"
              data-ocid="staff.giftcard.open_modal_button"
            >
              <Plus className="h-4 w-4" />
              Create Gift Card
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="staff.giftcard.dialog">
            <DialogHeader>
              <DialogTitle>Create Gift Card</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <Label>Code (auto-generated if empty)</Label>
                <Input
                  value={form.code}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="GW-XXXX-XXXX"
                  className="mt-1 font-mono"
                  data-ocid="staff.giftcard.code.input"
                />
              </div>
              <div>
                <Label>Balance (£) *</Label>
                <Input
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.balance}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, balance: e.target.value }))
                  }
                  placeholder="25.00"
                  className="mt-1"
                  data-ocid="staff.giftcard.balance.input"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                data-ocid="staff.giftcard.cancel.button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createGiftCard.isPending || !form.balance}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-ocid="staff.giftcard.save.button"
              >
                {createGiftCard.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {issued.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="staff.giftcard.empty_state"
        >
          <Gift className="h-8 w-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No gift cards issued yet.</p>
        </div>
      ) : (
        <div
          className="rounded-lg border border-border overflow-hidden"
          data-ocid="staff.giftcard.table"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {issued.map((card, i) => (
                <TableRow
                  key={card.code}
                  data-ocid={`staff.giftcard.row.${i + 1}`}
                >
                  <TableCell className="font-mono text-sm">
                    {card.code}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {card.balance}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ── Banners Tab ────────────────────────────────────────────────────────────────
function BannersTab() {
  const [banners, setBanners] = useState<PromoBanner[]>(() =>
    loadPromoBanners(),
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const emptyForm = {
    title: "",
    subtitle: "",
    ctaText: "",
    ctaLink: "",
    bgColor: "#1a4d2e",
  };
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (banner: PromoBanner) => {
    setEditingId(banner.id);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle,
      ctaText: banner.ctaText,
      ctaLink: banner.ctaLink,
      bgColor: banner.bgColor,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    let updated: PromoBanner[];
    if (editingId !== null) {
      updated = banners.map((b) =>
        b.id === editingId ? { ...b, ...form } : b,
      );
      toast.success("Banner updated");
    } else {
      const newBanner: PromoBanner = {
        id: `banner-${Date.now()}`,
        ...form,
      };
      updated = [...banners, newBanner];
      toast.success("Banner added");
    }
    setBanners(updated);
    savePromoBanners(updated);
    setDialogOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    const updated = banners.filter((b) => b.id !== id);
    setBanners(updated);
    savePromoBanners(updated);
    toast.success("Banner deleted");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-lg">Promotional Banners</h2>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setForm(emptyForm);
              setEditingId(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              onClick={openAdd}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-9"
              data-ocid="staff.banner.open_modal_button"
            >
              <Plus className="h-4 w-4" />
              Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" data-ocid="staff.banner.dialog">
            <DialogHeader>
              <DialogTitle>
                {editingId !== null ? "Edit Banner" : "New Banner"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="Spring Sale — 20% Off"
                  className="mt-1"
                  data-ocid="staff.banner.title.input"
                />
              </div>
              <div>
                <Label>Subtitle</Label>
                <Input
                  value={form.subtitle}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, subtitle: e.target.value }))
                  }
                  placeholder="Limited time offer on all plants"
                  className="mt-1"
                  data-ocid="staff.banner.subtitle.input"
                />
              </div>
              <div>
                <Label>CTA Text</Label>
                <Input
                  value={form.ctaText}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ctaText: e.target.value }))
                  }
                  placeholder="Shop Now"
                  className="mt-1"
                  data-ocid="staff.banner.cta_text.input"
                />
              </div>
              <div>
                <Label>CTA Link</Label>
                <Input
                  value={form.ctaLink}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ctaLink: e.target.value }))
                  }
                  placeholder="#products or https://..."
                  className="mt-1"
                  data-ocid="staff.banner.cta_link.input"
                />
              </div>
              <div>
                <Label>Background Colour</Label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="color"
                    value={form.bgColor}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, bgColor: e.target.value }))
                    }
                    className="h-9 w-16 rounded cursor-pointer border border-border p-0.5 bg-transparent"
                    data-ocid="staff.banner.bg_color.input"
                  />
                  <Input
                    value={form.bgColor}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, bgColor: e.target.value }))
                    }
                    placeholder="#1a4d2e"
                    className="font-mono flex-1"
                  />
                </div>
              </div>
              {/* Preview */}
              <div
                className="rounded-lg p-4 mt-1"
                style={{ backgroundColor: form.bgColor || "#1a4d2e" }}
              >
                <p className="text-white font-semibold text-sm">
                  {form.title || "Banner Title"}
                </p>
                {form.subtitle && (
                  <p className="text-white/70 text-xs mt-0.5">
                    {form.subtitle}
                  </p>
                )}
                {form.ctaText && (
                  <span className="mt-2 inline-block text-xs text-white bg-white/20 rounded px-2 py-0.5">
                    {form.ctaText}
                  </span>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                data-ocid="staff.banner.cancel.button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-ocid="staff.banner.save.button"
              >
                {editingId !== null ? "Update Banner" : "Add Banner"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {banners.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="staff.banner.empty_state"
        >
          <Megaphone className="h-8 w-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No promotional banners yet.</p>
          <p className="text-xs mt-1 opacity-60">
            Add banners to highlight promotions on the homepage.
          </p>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="staff.banner.list">
          {banners.map((banner, i) => (
            <div
              key={banner.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card"
              data-ocid={`staff.banner.item.${i + 1}`}
            >
              {/* Colour swatch */}
              <div
                className="h-12 w-12 rounded-lg shrink-0 shadow-sm"
                style={{ backgroundColor: banner.bgColor }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{banner.title}</p>
                {banner.subtitle && (
                  <p className="text-xs text-muted-foreground truncate">
                    {banner.subtitle}
                  </p>
                )}
                {banner.ctaText && (
                  <p className="text-xs text-primary mt-0.5 truncate">
                    CTA: {banner.ctaText}
                  </p>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openEdit(banner)}
                  data-ocid={`staff.banner.edit.button.${i + 1}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:text-destructive"
                      data-ocid={`staff.banner.delete.button.${i + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent data-ocid="staff.banner.delete.dialog">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Banner?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently remove "{banner.title}" from the
                        homepage.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel data-ocid="staff.banner.delete.cancel.button">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(banner.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        data-ocid="staff.banner.delete.confirm.button"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Wallet Tab ─────────────────────────────────────────────────────────────────
const WITHDRAWALS_KEY = "gw_withdrawals";

interface Withdrawal {
  id: string;
  amount: number; // pence
  paypalEmail: string;
  requestedAt: string; // ISO date
  status: "pending" | "completed";
}

function loadWithdrawals(): Withdrawal[] {
  try {
    const stored = localStorage.getItem(WITHDRAWALS_KEY);
    return stored ? (JSON.parse(stored) as Withdrawal[]) : [];
  } catch {
    return [];
  }
}

function saveWithdrawals(withdrawals: Withdrawal[]) {
  localStorage.setItem(WITHDRAWALS_KEY, JSON.stringify(withdrawals));
}

function WalletTab() {
  const { data: orders } = useAllOrders();

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(() =>
    loadWithdrawals(),
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [amountError, setAmountError] = useState("");

  const totalRevenuePence = (orders ?? []).reduce(
    (sum, o) => sum + Number(o.total),
    0,
  );

  const totalWithdrawnPence = withdrawals
    .filter((w) => w.status === "completed")
    .reduce((sum, w) => sum + w.amount, 0);

  const availableBalancePence = totalRevenuePence - totalWithdrawnPence;

  const fmt = (pence: number) => `£${(pence / 100).toFixed(2)}`;

  const handleRequestWithdrawal = () => {
    setAmountError("");
    const amountPounds = Number.parseFloat(amountInput);
    if (!amountInput || Number.isNaN(amountPounds) || amountPounds < 0.01) {
      setAmountError("Please enter a valid amount (min £0.01)");
      return;
    }
    const amountPence = Math.round(amountPounds * 100);
    if (amountPence > availableBalancePence) {
      setAmountError(
        `Amount exceeds available balance (${fmt(availableBalancePence)})`,
      );
      return;
    }
    if (!paypalEmail.includes("@")) {
      setAmountError("Please enter a valid PayPal email address");
      return;
    }

    const newWithdrawal: Withdrawal = {
      id: `wd-${Date.now()}`,
      amount: amountPence,
      paypalEmail,
      requestedAt: new Date().toISOString(),
      status: "pending",
    };
    const updated = [newWithdrawal, ...withdrawals];
    setWithdrawals(updated);
    saveWithdrawals(updated);
    toast.success("Withdrawal request saved");
    setDialogOpen(false);
    setAmountInput("");
    setPaypalEmail("");
    setAmountError("");
  };

  const handleMarkComplete = (id: string) => {
    const updated = withdrawals.map((w) =>
      w.id === id ? { ...w, status: "completed" as const } : w,
    );
    setWithdrawals(updated);
    saveWithdrawals(updated);
    toast.success("Withdrawal marked as completed");
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setAmountInput("");
      setPaypalEmail("");
      setAmountError("");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-lg">Wallet</h2>
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-9"
              data-ocid="staff.wallet.open_modal_button"
            >
              <ArrowDownToLine className="h-4 w-4" />
              Request Withdrawal
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="staff.wallet.dialog">
            <DialogHeader>
              <DialogTitle>Request Withdrawal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="wallet-amount">
                  Amount (£) *
                  <span className="ml-2 text-xs text-muted-foreground font-normal">
                    Available: {fmt(availableBalancePence)}
                  </span>
                </Label>
                <Input
                  id="wallet-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={(availableBalancePence / 100).toFixed(2)}
                  value={amountInput}
                  onChange={(e) => {
                    setAmountInput(e.target.value);
                    setAmountError("");
                  }}
                  placeholder="0.00"
                  className="mt-1"
                  data-ocid="staff.wallet.amount.input"
                />
              </div>
              <div>
                <Label htmlFor="wallet-paypal">PayPal Email *</Label>
                <Input
                  id="wallet-paypal"
                  type="email"
                  value={paypalEmail}
                  onChange={(e) => {
                    setPaypalEmail(e.target.value);
                    setAmountError("");
                  }}
                  placeholder="your@paypal.com"
                  className="mt-1"
                  data-ocid="staff.wallet.paypal_email.input"
                />
              </div>
              {amountError && (
                <p
                  className="text-sm text-destructive"
                  data-ocid="staff.wallet.error_state"
                >
                  {amountError}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => handleDialogClose(false)}
                data-ocid="staff.wallet.cancel.button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRequestWithdrawal}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-ocid="staff.wallet.submit.button"
              >
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Total Revenue */}
        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <p className="text-xs font-semibold uppercase tracking-widest text-green-700">
              Total Revenue
            </p>
          </div>
          <p className="text-2xl font-bold text-green-800">
            {fmt(totalRevenuePence)}
          </p>
          <p className="text-xs text-green-600 mt-1">
            From {(orders ?? []).length} order
            {(orders ?? []).length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Total Withdrawn */}
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDownToLine className="h-4 w-4 text-orange-600" />
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-700">
              Total Withdrawn
            </p>
          </div>
          <p className="text-2xl font-bold text-orange-800">
            {fmt(totalWithdrawnPence)}
          </p>
          <p className="text-xs text-orange-600 mt-1">
            {withdrawals.filter((w) => w.status === "completed").length}{" "}
            completed withdrawal
            {withdrawals.filter((w) => w.status === "completed").length !== 1
              ? "s"
              : ""}
          </p>
        </div>

        {/* Available Balance */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 sm:col-span-1 ring-1 ring-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Available Balance
            </p>
          </div>
          <p className="text-3xl font-bold text-primary">
            {fmt(Math.max(0, availableBalancePence))}
          </p>
          <p className="text-xs text-primary/70 mt-1">Ready to withdraw</p>
        </div>
      </div>

      {/* Withdrawal History */}
      <div>
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-widest mb-3">
          Withdrawal History
        </h3>

        {withdrawals.length === 0 ? (
          <div
            className="text-center py-12 text-muted-foreground"
            data-ocid="staff.wallet.empty_state"
          >
            <Wallet className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No withdrawal requests yet.</p>
            <p className="text-xs mt-1 opacity-60">
              Request a withdrawal when you're ready to move funds to PayPal.
            </p>
          </div>
        ) : (
          <div
            className="rounded-lg border border-border overflow-hidden"
            data-ocid="staff.wallet.table"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>PayPal Email</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((withdrawal, i) => (
                  <TableRow
                    key={withdrawal.id}
                    data-ocid={`staff.wallet.row.${i + 1}`}
                  >
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(withdrawal.requestedAt).toLocaleDateString(
                        "en-GB",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {withdrawal.paypalEmail}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {fmt(withdrawal.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          withdrawal.status === "completed"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-yellow-100 text-yellow-800 border-yellow-200"
                        }
                      >
                        {withdrawal.status === "completed"
                          ? "Completed"
                          : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {withdrawal.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={() => handleMarkComplete(withdrawal.id)}
                          data-ocid={`staff.wallet.mark_complete.button.${i + 1}`}
                        >
                          <Check className="h-3 w-3" />
                          Mark Complete
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main StaffPage ─────────────────────────────────────────────────────────────
export function StaffPage() {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem(STAFF_SESSION_KEY) === "true",
  );

  if (!authenticated) {
    return <StaffLogin onSuccess={() => setAuthenticated(true)} />;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Staff Panel
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your Gardening World store
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            sessionStorage.removeItem(STAFF_SESSION_KEY);
            setAuthenticated(false);
          }}
          className="text-muted-foreground"
          data-ocid="staff.logout.button"
        >
          <Lock className="h-4 w-4 mr-2" />
          Lock Panel
        </Button>
      </div>

      <Tabs defaultValue="products">
        <TabsList className="mb-6 bg-secondary flex-wrap h-auto gap-1">
          <TabsTrigger
            value="products"
            className="gap-2"
            data-ocid="staff.products.tab"
          >
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="gap-2"
            data-ocid="staff.categories.tab"
          >
            <Grid3X3 className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger
            value="coupons"
            className="gap-2"
            data-ocid="staff.coupons.tab"
          >
            <Tag className="h-4 w-4" />
            Coupons
          </TabsTrigger>
          <TabsTrigger
            value="payment"
            className="gap-2"
            data-ocid="staff.payment.tab"
          >
            <CreditCard className="h-4 w-4" />
            Payment
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className="gap-2"
            data-ocid="staff.orders.tab"
          >
            <ShoppingBag className="h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger
            value="wallet"
            className="gap-2"
            data-ocid="staff.wallet.tab"
          >
            <Wallet className="h-4 w-4" />
            Wallet
          </TabsTrigger>
          <TabsTrigger
            value="giftcards"
            className="gap-2"
            data-ocid="staff.giftcards.tab"
          >
            <Gift className="h-4 w-4" />
            Gift Cards
          </TabsTrigger>
          <TabsTrigger
            value="banners"
            className="gap-2"
            data-ocid="staff.banners.tab"
          >
            <Megaphone className="h-4 w-4" />
            Banners
          </TabsTrigger>
        </TabsList>

        <div className="crystal-card rounded-xl p-6">
          <TabsContent value="products">
            <ProductsTab />
          </TabsContent>
          <TabsContent value="categories">
            <CategoriesTab />
          </TabsContent>
          <TabsContent value="coupons">
            <CouponsTab />
          </TabsContent>
          <TabsContent value="payment">
            <PaymentTab />
          </TabsContent>
          <TabsContent value="orders">
            <OrdersTab />
          </TabsContent>
          <TabsContent value="wallet">
            <WalletTab />
          </TabsContent>
          <TabsContent value="giftcards">
            <GiftCardsTab />
          </TabsContent>
          <TabsContent value="banners">
            <BannersTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
