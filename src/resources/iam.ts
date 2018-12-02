import * as AWS from 'aws-sdk';
import * as BPromise from 'bluebird';
import * as colors from 'colors/safe';
import { ICleanOptions, IIAMList, IResourceCleaner } from '../types';
import { BaseResource } from './BaseResource';

export class IAM extends BaseResource implements IResourceCleaner {
  protected iam: AWS.IAM;

  public constructor(options: ICleanOptions) {
    super('IAM', options);

    this.iam =
      options.iam ||
      new AWS.IAM({
        region: options && options.region ? options.region : undefined,
      });
  }

  public async list(): Promise<object> {
    console.log('[IAM] Listing IAM');

    this.emit('listStarted', { resource: this, region: this.region });

    const policies = this.listPolicies();
    const roles = this.listRoles();
    const accessKeys = this.listAccessKeys();
    const users = this.listUsers();

    await BPromise.all([policies, roles, accessKeys, users]);

    try {
      const file: IIAMList = {
        region: this.region,
        profile: this.profile,
        policies: await policies,
        roles: await roles,
        accessKeys: await accessKeys,
        users: await users,
      };

      console.log('[IAM] Listing IAM Completed');

      return file;
    } catch (error) {
      console.error(error);

      throw error;
    } finally {
      this.emit('listCompleted', { resource: this, region: this.region });
    }
  }

  public async remove({ policies }: { policies: string[] }): Promise<number> {
    try {
      const processes = policies.map((policy: string) => {
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
      console.error(colors.yellow(error.message));

      return [];
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
      console.error(colors.yellow(error.message));

      return [];
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
      console.error(colors.yellow(error.message));

      return [];
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
      console.error(colors.yellow(error.message));

      return [];
    }
  }
}
