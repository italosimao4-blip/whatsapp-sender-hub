import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Validation schema
const formSchema = z.object({
  template: z.string().min(1, { message: "Por favor, selecione um template" }),
  phoneNumberId: z.string().min(1, { message: "Por favor, selecione um ID de telefone" }),
  recipientPhone: z
    .string()
    .min(1, { message: "Por favor, insira o número do destinatário" })
    .regex(/^55\d{10,11}$/, {
      message: "Formato inválido. Use: 5599999999999 (somente números)",
    }),
});

type FormValues = z.infer<typeof formSchema>;

interface WebhookResponse {
  message?: string;
  [key: string]: any;
}

const Index = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentPayload, setSentPayload] = useState<any>(null);
  const [webhookResponse, setWebhookResponse] = useState<WebhookResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Configurações facilmente editáveis
  const WEBHOOK_URL = "https://example-n8n-webhook-url.com/";
  const TEMPLATES = [
    { value: "hello_world", label: "hello_world" },
    { value: "order_update", label: "order_update" },
    { value: "appointment_reminder", label: "appointment_reminder" },
  ];
  const PHONE_IDS = [
    { value: "785310631336841", label: "785310631336841" },
    { value: "123456789012345", label: "123456789012345" },
  ];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      template: "",
      phoneNumberId: "",
      recipientPhone: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setError(null);
    setSentPayload(null);
    setWebhookResponse(null);

    const payload = {
      messaging_product: "whatsapp",
      from_phone_number_id: values.phoneNumberId,
      to: values.recipientPhone,
      type: "template",
      template: {
        name: values.template,
        language: {
          code: "en_US",
        },
      },
      debug: {
        ui_origin: "lovable-web-sender",
        sent_at: new Date().toISOString(),
      },
    };

    setSentPayload(payload);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Erro: ${response.status}`);
      }

      setWebhookResponse(data);
      toast({
        title: "Mensagem enviada com sucesso!",
        description: "O template foi enviado para o webhook.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao enviar";
      setError(errorMessage);
      toast({
        title: "Erro ao enviar",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">
            IM Soluções Digitais - Enviar Templates de Whatsapp
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Fill the fields below to send a WhatsApp template via webhook to n8n.
          </p>
        </header>

        {/* Form Card */}
        <Card className="p-6 md:p-8 space-y-6 bg-card border-border">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Template Selection */}
              <FormField
                control={form.control}
                name="template"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary text-base font-medium">
                      1 - Choose your template
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-secondary border-input text-foreground">
                          <SelectValue placeholder="Selecione um template..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover border-border">
                        {TEMPLATES.map((template) => (
                          <SelectItem key={template.value} value={template.value}>
                            {template.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              {/* Phone ID Selection */}
              <FormField
                control={form.control}
                name="phoneNumberId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary text-base font-medium">
                      2 - Choose the phone number ID
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-secondary border-input text-foreground">
                          <SelectValue placeholder="Selecione um ID de telefone..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover border-border">
                        {PHONE_IDS.map((phone) => (
                          <SelectItem key={phone.value} value={phone.value}>
                            {phone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              {/* Recipient Phone Input */}
              <FormField
                control={form.control}
                name="recipientPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary text-base font-medium">
                      3 - Recipient phone number (format: 5599999999999)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="5599999999999"
                        {...field}
                        className="bg-secondary border-input text-foreground placeholder:text-muted-foreground"
                        onChange={(e) => {
                          // Only allow digits
                          const value = e.target.value.replace(/\D/g, "");
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto px-8 bg-secondary text-primary border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Mensagem"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Card>

        {/* Results Section */}
        {(sentPayload || webhookResponse || error) && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary text-center">
              Detalhes do Envio
            </h2>

            {/* Sent Payload */}
            {sentPayload && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary">Payload enviado</h3>
                <pre className="bg-code-bg p-4 rounded-lg overflow-x-auto text-sm text-foreground border border-border font-mono">
                  {JSON.stringify(sentPayload, null, 2)}
                </pre>
              </div>
            )}

            {/* Webhook Response */}
            {webhookResponse && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary">Webhook / API response</h3>
                <pre className="bg-code-bg p-4 rounded-lg overflow-x-auto text-sm text-foreground border border-border font-mono">
                  {JSON.stringify(webhookResponse, null, 2)}
                </pre>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-destructive">Erro</h3>
                <pre className="bg-code-bg p-4 rounded-lg overflow-x-auto text-sm text-destructive border border-destructive font-mono">
                  {error}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
