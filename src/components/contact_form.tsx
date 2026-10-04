"use client";

import { Button, Card, FieldError, Form, Input, Label, Spinner, TextArea, TextField } from "@heroui/react";
import { P, SecondHeading } from "@/app/_components/textStyles";
import { TextLink } from "@/app/_components/links";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import axios from "axios";

const contactFormSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Adresse email doit contenir un @; ").nonempty("Email est requis"),
  telephone: z.string().nonempty("Numéro de téléphone requis"),
  message: z.string().nonempty("Un message expliquant la demande est requis"),
});

type FormValues = { name: string; email: string; telephone: string; message: string };
type ValidationErrors = Partial<Record<keyof FormValues, string[]>>;

const EMPTY_FORM: FormValues = { name: "", email: "", telephone: "", message: "" };

// HeroUI v3 form. zod checks the values on submit; its messages go to Form's validationErrors,
// which shows each one in the FieldError of its field and clears it once the field is edited
// and left. validationBehavior="aria": no browser bubble, only the site's messages.
export function ContactForm() {
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [backendError, setBackendError] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const fieldProps = (name: keyof FormValues) => ({
    name,
    value: values[name],
    onChange: (value: string) => setValues((prev) => ({ ...prev, [name]: value })),
    variant: "secondary" as const,
    fullWidth: true,
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBackendError(false);
    const result = contactFormSchema.safeParse(values);
    if (!result.success) {
      setValidationErrors(result.error.flatten().fieldErrors);
      return;
    }
    setValidationErrors({});
    const formEndpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT?.trim();
    if (!formEndpoint) {
      setBackendError(true);
      return;
    }
    setIsSending(true);
    axios
      .post(formEndpoint, values, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
      })
      .then(() => {
        setValues(EMPTY_FORM);
        setSubmissionSuccess(true);
      })
      .catch(() => setBackendError(true))
      .finally(() => setIsSending(false));
  };

  return (
    <Card>
      <Card.Content>
        {submissionSuccess ? (
          <div role="status" aria-live="polite" aria-atomic="true">
            <SecondHeading customClasses="text-xl lg:text-2xl 2xl:text-[30px] mt-2 mb-4">Merci pour votre confiance !</SecondHeading>
            <P content="Merci pour votre demande! Nous allons la traiter dans les plus brefs délais." />
          </div>
        ) : (
          <Form
            onSubmit={handleSubmit}
            validationBehavior="aria"
            validationErrors={validationErrors}
            className="flex flex-col gap-6"
          >
            <div>
              <SecondHeading customClasses="text-xl lg:text-2xl 2xl:text-[30px] mt-2 mb-4">Contactez-nous</SecondHeading>
              <p className="text-muted">Nous sommes à l&apos;écoute de vos besoins pour toute rénovation, plomberie, électricité ou toiture.</p>
            </div>
            {Object.keys(validationErrors).length > 0 && (
              <p className="text-sm text-danger" role="alert" aria-live="polite" aria-atomic="true">
                Le formulaire contient des erreurs. Veuillez corriger les champs indiqués.
              </p>
            )}
            <div className="flex flex-col gap-4">
              <TextField {...fieldProps("name")}>
                <Label>Nom et Prénom</Label>
                <Input placeholder="Entrez votre nom et prénom" />
                <FieldError />
              </TextField>
              <TextField {...fieldProps("email")}>
                <Label>Email</Label>
                <Input placeholder="Entrez votre email" />
                <FieldError />
              </TextField>
              <TextField {...fieldProps("telephone")}>
                <Label>Téléphone</Label>
                <Input placeholder="04XXXXXXXX" />
                <FieldError />
              </TextField>
              <TextField {...fieldProps("message")}>
                <Label>Message</Label>
                <TextArea rows={4} placeholder="Bonjour, je serais intéressé par des services de ..." />
                <FieldError />
              </TextField>
            </div>
            <Button type="submit" fullWidth isPending={isSending}>
              {({ isPending }) => (
                <>
                  {isPending ? <Spinner color="current" size="sm" /> : null}
                  Envoyer
                </>
              )}
            </Button>
            <p className="text-sm text-muted italic">
              Nous ne partageons vos informations à <span className="underline underline-offset-4">aucun</span> tiers.
            </p>
            {backendError && (
              <p className="text-sm text-danger" role="alert" aria-live="assertive" aria-atomic="true">
                Oups quelque chose s&apos;est mal passé, contactez-nous par email à{" "}
                <TextLink underline href="mailto:info@macar.be">info@macar.be</TextLink>
              </p>
            )}
          </Form>
        )}
      </Card.Content>
    </Card>
  );
}
