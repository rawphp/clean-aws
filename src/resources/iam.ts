import * as AWS from 'aws-sdk';
import { ICleanOptions, IResourceCleaner } from '../types';

export interface IIAMList {
  region: string;
  policies: string[];
  roles: string[];
  accessKeys: string[];
  users: string[];
}

export class IAM implements IResourceCleaner {
  protected iam: AWS.IAM;
  protected region: string;

  public constructor(options: ICleanOptions) {
    this.region = options.region;
    this.iam =
      options.ec2 ||
      new AWS.IAM({
        region: options && options.region ? options.region : undefined,
      });
  }

  public async list(): Promise<object> {
    console.log('[IAM] Listing IAM');

    try {
      const file: IIAMList = {
        region: this.region,
        policies: await this.listPolicies(),
        roles: await this.listRoles(),
        accessKeys: await this.listAccessKeys(),
        users: await this.listUsers(),
      };

      return file;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  public async remove(policyArns: string[]): Promise<number> {
    try {
      const processes = policyArns.map((policy: string) => {
        return this.iam
          .deletePolicy({
            PolicyArn: policy,
          })
          .promise();
      });

      await Promise.all(processes);

      return 0;
    } catch (error) {
      console.error(error);

      return 1;
    }
  }

  protected async listPolicies(): Promise<string[]> {
    console.log('[IAM] Listing Policies');

    try {
      const response = await this.iam.listPolicies().promise();

      if (!response || !response.Policies) {
        return [];
      }

      return response && response.Policies
        ? response.Policies.map((policy: AWS.IAM.Policy) => policy.Arn as string)
        : [];
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  protected async listRoles(): Promise<string[]> {
    console.log('[IAM] Listing Roles');

    try {
      const response = await this.iam.listRoles().promise();

      if (!response || !response.Roles) {
        return [];
      }

      return response && response.Roles ? response.Roles.map((role: AWS.IAM.Role) => role.Arn as string) : [];
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  protected async listAccessKeys(): Promise<string[]> {
    console.log('[IAM] Listing Access Keys');

    try {
      const response = await this.iam.listAccessKeys().promise();

      if (!response || !response.AccessKeyMetadata) {
        return [];
      }

      return response && response.AccessKeyMetadata
        ? response.AccessKeyMetadata.map((key: AWS.IAM.AccessKeyMetadata) => key.AccessKeyId as string)
        : [];
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  protected async listUsers(): Promise<string[]> {
    console.log('[IAM] Listing Users');

    try {
      const response = await this.iam.listUsers().promise();

      if (!response || !response.Users) {
        return [];
      }

      return response && response.Users ? response.Users.map((user: AWS.IAM.User) => user.UserId as string) : [];
    } catch (error) {
      console.error(error);

      throw error;
    }
  }
}
